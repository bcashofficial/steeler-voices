"""Everything a pipeline can write about the community, and the reads it
needs to decide what to do next. Views validate; these functions do the
work and return plain dicts of counts."""

import hashlib
from collections import Counter
from datetime import date, datetime

from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone

from lookups.models import LKSources
from pipelines.models import PipelineRun
from voices.models import Author, Embedding, Game, Reading, Topic, Voice, Week
from voices.weeks import week_end_for, week_start_for


def week_for(moment: datetime) -> Week:
    starts_on = week_start_for(moment)
    week, _ = Week.objects.get_or_create(
        starts_on=starts_on, defaults={"ends_on": week_end_for(starts_on), "season": starts_on.year}
    )
    return week


def content_hash(title: str, body_text: str) -> str:
    return hashlib.sha256(f"{title}\n{body_text}".encode()).hexdigest()


def _authors_for(source: LKSources, items: list[dict]) -> dict[str, Author]:
    """Every author in the batch, created where new, in two queries."""
    handles = {item["author"] for item in items}
    known = {a.handle: a for a in Author.objects.filter(source=source, handle__in=handles)}
    first_seen = {}
    for item in items:
        if item["author"] not in known:
            first_seen.setdefault(item["author"], item["posted_at"])
    Author.objects.bulk_create(
        [Author(source=source, handle=h, first_seen_at=seen) for h, seen in first_seen.items()], ignore_conflicts=True
    )
    if first_seen:
        known.update({a.handle: a for a in Author.objects.filter(source=source, handle__in=first_seen)})
    return known


def _weeks_for(items: list[dict]) -> dict[date, Week]:
    weeks = {}
    for item in items:
        starts_on = week_start_for(item["posted_at"])
        if starts_on not in weeks:
            weeks[starts_on] = week_for(item["posted_at"])
    return weeks


def _apply_item(voice: Voice, item: dict, now: datetime) -> bool:
    """Write the item's fields onto a voice; True when something changed."""
    new_hash = content_hash(item["title"], item["body_text"])
    changed = voice.content_hash != new_hash or voice.score != item["score"] or voice.reply_count != item["reply_count"]
    voice.title, voice.body_text, voice.body_html = item["title"], item["body_text"], item["body_html"]
    voice.flair, voice.score, voice.reply_count = item["flair"], item["score"], item["reply_count"]
    voice.external_url, voice.content_hash, voice.last_seen_at = item["external_url"], new_hash, now
    return changed


UPDATED_FIELDS = [
    "title",
    "body_text",
    "body_html",
    "flair",
    "score",
    "reply_count",
    "external_url",
    "content_hash",
    "last_seen_at",
]


@transaction.atomic
def ingest_voices(source: LKSources, run: PipelineRun | None, items: list[dict]) -> dict:
    """Upsert a batch of posts and comments by (source, external_id) in a
    handful of queries, then resolve every thread and parent reference the
    batch or the table can satisfy. A parent that has not arrived yet is
    left null and picked up by a later batch."""
    counts: Counter = Counter(received=len(items))
    now = timezone.now()
    authors, weeks = _authors_for(source, items), _weeks_for(items)
    existing = {
        v.external_id: v for v in Voice.objects.filter(source=source, external_id__in=[i["external_id"] for i in items])
    }
    fresh, changed, untouched = [], [], []
    for item in items:
        voice = existing.get(item["external_id"])
        if voice is None:
            voice = Voice(
                source=source,
                external_id=item["external_id"],
                voice_type=item["voice_type"],
                author=authors[item["author"]],
                posted_at=item["posted_at"],
                first_seen_at=now,
                week=weeks[week_start_for(item["posted_at"])],
                ingest_run=run,
            )
            _apply_item(voice, item, now)
            fresh.append(voice)
        elif not item.get("weak") and _apply_item(voice, item, now):
            changed.append(voice)
        else:
            untouched.append(voice)
    Voice.objects.bulk_create(fresh, batch_size=500)
    Voice.objects.bulk_update(changed, UPDATED_FIELDS, batch_size=500)
    Voice.objects.filter(pk__in=[v.pk for v in untouched]).update(last_seen_at=now)
    counts.update(new=len(fresh), updated=len(changed), unchanged=len(untouched))
    counts["orphans"] = _link_threads(source, items)
    counts["authors_recounted"] = _recount_authors(source, {item["author"] for item in items})
    return dict(counts)


def _link_threads(source: LKSources, items: list[dict]) -> int:
    """Point each comment at its thread root and its parent; returns how
    many parents are still unknown."""
    by_external = {
        v.external_id: v
        for v in Voice.objects.filter(source=source, external_id__in=_referenced_ids(items)).select_related(
            "voice_type"
        )
    }
    orphans, linked = 0, []
    for item in items:
        voice = by_external.get(item["external_id"])
        if voice is None or voice.voice_type.key == "post":
            continue
        thread = by_external.get(item.get("thread_external_id") or "")
        parent = by_external.get(item.get("parent_external_id") or "")
        voice.thread, voice.parent = thread, parent
        voice.depth = None if parent is None else (parent.depth or 0) + 1
        orphans += parent is None
        linked.append(voice)
    Voice.objects.bulk_update(linked, ["thread", "parent", "depth"], batch_size=500)
    return orphans


def _referenced_ids(items: list[dict]) -> set[str]:
    ids = set()
    for item in items:
        ids.add(item["external_id"])
        for key in ("thread_external_id", "parent_external_id"):
            if item.get(key):
                ids.add(item[key])
    return ids


def _recount_authors(source: LKSources, handles: set[str]) -> int:
    """Recount voices for the authors this batch touched, in one query."""
    counted = Author.objects.filter(source=source, handle__in=handles).annotate(n=Count("voices"))
    stale = [a for a in counted if a.voice_count != a.n]
    for author in stale:
        author.voice_count = author.n
    Author.objects.bulk_update(stale, ["voice_count"], batch_size=500)
    return len(stale)


def voice_text(voice: Voice) -> str:
    return f"{voice.title}\n{voice.body_text}".strip()


def pending_voices(need: str, limit: int, week: date | None = None) -> list[dict]:
    """Voices that still need an embedding, a reading, or a place on the map."""
    qs = Voice.objects.filter(is_active=True).select_related("week")
    if week is not None:
        qs = qs.filter(week__starts_on=week)
    if need == "embedding":
        qs = qs.filter(embedding__isnull=True)
    elif need == "reading":
        qs = qs.filter(readings__isnull=True)
    elif need == "projection":
        qs = qs.filter(embedding__isnull=False).filter(Q(embedding__x__isnull=True) | Q(embedding__y__isnull=True))
    qs = qs.exclude(body_text="", title="").order_by("posted_at")[:limit]
    return [
        {
            "voice_id": str(v.voice_id),
            "external_id": v.external_id,
            "text": voice_text(v),
            "posted_at": v.posted_at,
            "week": v.week.starts_on,
        }
        for v in qs
    ]


@transaction.atomic
def upsert_embeddings(run: PipelineRun | None, model: str, items: list[dict]) -> dict:
    written = 0
    for item in items:
        Embedding.objects.update_or_create(
            voice_id=item["voice_id"],
            defaults={"vector": item["vector"], "model": model, "source_text": item["source_text"], "embed_run": run},
        )
        written += 1
    return {"received": len(items), "written": written}


def list_embeddings(week: date | None, limit: int, offset: int) -> list[dict]:
    qs = Embedding.objects.select_related("voice__week").order_by("voice__posted_at")
    if week is not None:
        qs = qs.filter(voice__week__starts_on=week)
    return [
        {
            "voice_id": str(e.voice_id),
            "vector": list(e.vector),
            "week": e.voice.week.starts_on,
            "text": voice_text(e.voice),
        }
        for e in qs[offset : offset + limit]
    ]


@transaction.atomic
def apply_projection(run: PipelineRun | None, items: list[dict]) -> dict:
    written = 0
    for item in items:
        written += Embedding.objects.filter(voice_id=item["voice_id"]).update(
            x=item["x"], y=item["y"], projection_run=run
        )
    return {"received": len(items), "written": written}


@transaction.atomic
def upsert_readings(run: PipelineRun, model: str, prompt_version: str, items: list[dict]) -> dict:
    written = 0
    for item in items:
        Reading.objects.update_or_create(
            voice_id=item["voice_id"],
            tag_run=run,
            defaults={
                "mood": item["mood"],
                "intensity": item["intensity"],
                "target": item["target"],
                "sarcasm": item["sarcasm"],
                "gist": item["gist"],
                "subjects": item["subjects"],
                "model": model,
                "prompt_version": prompt_version,
                "raw": item["raw"],
            },
        )
        written += 1
    return {"received": len(items), "written": written}


@transaction.atomic
def replace_topics(run: PipelineRun | None, week_start: date, topics: list[dict]) -> dict:
    """A week's topics are recomputed whole: drop the old set, write the
    new one, point each embedding at its topic."""
    week = Week.objects.get(starts_on=week_start)
    Topic.objects.filter(week=week).delete()
    assigned = 0
    for rank, item in enumerate(sorted(topics, key=lambda t: -len(t["voice_ids"])), start=1):
        topic = Topic.objects.create(
            week=week,
            label=item["label"],
            summary=item["summary"],
            centroid=item["centroid"],
            size=len(item["voice_ids"]),
            rank=rank,
            cluster_run=run,
        )
        assigned += Embedding.objects.filter(voice_id__in=item["voice_ids"]).update(topic=topic)
    return {"topics": len(topics), "assigned": assigned}


@transaction.atomic
def upsert_games(items: list[dict]) -> dict:
    counts: Counter = Counter()
    for item in items:
        _, created = Game.objects.update_or_create(
            espn_event_id=item["espn_event_id"],
            defaults={**{k: v for k, v in item.items() if k != "espn_event_id"}, "week": week_for(item["kickoff_at"])},
        )
        counts["new" if created else "updated"] += 1
    return dict(counts)
