"""What the app reads about the community: the weeks, a week's posts for the
rail, one thread with every voice's newest reading, and the week's map.
Pure reads — nothing here writes — returning plain dicts the views hand back.
"""

from collections import Counter, defaultdict
from datetime import date

from django.db.models import Count, F, Q

from voices.models import Embedding, Reading, Voice, Week

RAIL_LIMIT = 60
THREAD_LIMIT = 400
MAP_LIMIT = 3000
MOST_RETRIEVED_LIMIT = 12
TOP_SUBJECTS_LIMIT = 8
MAP_TEXT_LENGTH = 140


def yards_for(intensity: float) -> int:
    """A reading's intensity on the 100-yard field."""
    return round(max(0.0, min(1.0, intensity)) * 100)


def newest_readings(voice_ids) -> dict:
    """The newest reading per voice, in one query."""
    newest = {}
    rows = Reading.objects.filter(voice_id__in=voice_ids).select_related("mood").order_by("voice_id", "-created_at")
    for reading in rows:
        newest.setdefault(reading.voice_id, reading)
    return newest


def mood_shares(readings) -> list[dict]:
    """A set of readings as shares of its 100 yards by mood, loudest first."""
    counts = Counter(reading.mood.key for reading in readings)
    total = sum(counts.values())
    return [{"mood": mood, "share": n / total} for mood, n in counts.most_common()] if total else []


def reading_payload(reading: Reading | None) -> dict | None:
    if reading is None:
        return None
    return {
        "mood": reading.mood.key,
        "yards": yards_for(reading.intensity),
        "sarcasm": reading.sarcasm,
        "subjects": reading.subjects,
        "gist": reading.gist,
    }


def game_payload(game) -> dict:
    return {
        "opponent": game.opponent,
        "opponent_abbreviation": game.opponent_abbreviation,
        "is_home": game.is_home,
        "kickoff_at": game.kickoff_at,
        "status": game.status,
        "steelers_score": game.steelers_score,
        "opponent_score": game.opponent_score,
    }


def week_payload(week: Week) -> dict:
    return {
        "starts_on": week.starts_on,
        "ends_on": week.ends_on,
        "label": week.label or str(week),
        "posts": week.post_count,
        "comments": week.comment_count,
        "games": [game_payload(game) for game in week.games.all()],
    }


def _weeks_with_voices():
    return (
        Week.objects.annotate(
            post_count=Count("voices", filter=Q(voices__voice_type__key="post", voices__is_active=True)),
            comment_count=Count("voices", filter=Q(voices__voice_type__key="comment", voices__is_active=True)),
        )
        .filter(post_count__gt=0)
        .prefetch_related("games")
        .order_by("-starts_on")
    )


def list_weeks() -> list[dict]:
    """Every week that has voices, newest first, with its counts and games."""
    return [week_payload(week) for week in _weeks_with_voices()]


def week_subjects(week: Week, limit: int = TOP_SUBJECTS_LIMIT) -> list[dict]:
    """The week's most-read subjects, from every voice's newest reading."""
    voice_ids = Voice.objects.filter(week=week, is_active=True).values_list("voice_id", flat=True)
    counts: Counter = Counter()
    for reading in newest_readings(voice_ids).values():
        counts.update(reading.subjects)
    return [{"label": label, "count": n} for label, n in counts.most_common(limit)]


def week_detail(starts_on: date) -> dict:
    """The flyer's numbers: the week, its game, its counts and top subjects."""
    week = _weeks_with_voices().get(starts_on=starts_on)
    subjects = week_subjects(week)
    counts = {
        "posts": week.post_count,
        "comments": week.comment_count,
        "subjects": len(subjects),
        "projected": Embedding.objects.filter(voice__week=week, x__isnull=False).count(),
        "documents": week.documents.count(),
        "generation_runs": week.generation_runs.count(),
    }
    return {"week": week_payload(week), "counts": counts, "subjects": subjects}


def _posts_of(week: Week):
    return (
        Voice.objects.filter(week=week, is_active=True, voice_type__key="post")
        .select_related("author")
        .annotate(captured=Count("replies", filter=Q(replies__is_active=True)))
        .order_by(F("reply_count").desc(nulls_last=True), "-captured", "-score")
    )


def week_posts(starts_on: date, limit: int = RAIL_LIMIT) -> list[dict]:
    """The rail: the week's posts with the mood mix of each one's thread.
    `comments` is the community's count; `captured` how many are here."""
    week = Week.objects.get(starts_on=starts_on)
    posts = list(_posts_of(week)[:limit])
    replies = Voice.objects.filter(thread__in=posts, is_active=True).values_list("voice_id", "thread_id")
    members = defaultdict(list)
    for voice_id, thread_id in replies:
        members[thread_id].append(voice_id)
    for post in posts:
        members[post.voice_id].append(post.voice_id)
    readings = newest_readings([voice_id for ids in members.values() for voice_id in ids])
    return [
        {
            "voice_id": str(post.voice_id),
            "title": post.title,
            "handle": post.author.handle,
            "posted_at": post.posted_at,
            "external_url": post.external_url,
            "score": post.score,
            "comments": post.reply_count if post.reply_count is not None else post.captured,
            "captured": post.captured,
            "shares": mood_shares([readings[v] for v in members[post.voice_id] if v in readings]),
        }
        for post in posts
    ]


def _voice_payload(voice: Voice, reading: Reading | None, topic: str | None, op_handle: str) -> dict:
    return {
        "voice_id": str(voice.voice_id),
        "handle": voice.author.handle,
        "posted_at": voice.posted_at,
        "score": voice.score,
        "title": voice.title,
        "body": voice.body_text,
        "external_url": voice.external_url,
        "depth": voice.depth or 0,
        "parent_id": str(voice.parent_id) if voice.parent_id else None,
        "op": voice.author.handle == op_handle,
        "reading": reading_payload(reading),
        "topic": topic,
    }


def _in_thread_order(post: Voice, comments: list[Voice]) -> list[Voice]:
    """Comments as the thread reads: each reply under what it answered,
    siblings by score. A reply whose parent is missing hangs off the post."""
    known = {c.voice_id for c in comments}
    children = defaultdict(list)
    for comment in comments:
        parent = comment.parent_id if comment.parent_id in known else post.voice_id
        children[parent].append(comment)
    ordered, stack = [], sorted(children[post.voice_id], key=_by_score)
    while stack:
        comment = stack.pop(0)
        ordered.append(comment)
        stack = sorted(children[comment.voice_id], key=_by_score) + stack
    return ordered


def _by_score(voice: Voice):
    return (-(voice.score or 0), voice.posted_at)


def thread(voice_id, limit: int = THREAD_LIMIT) -> dict:
    """One thread: the post and its comments in reading order, each with its
    newest reading and its topic."""
    post = Voice.objects.select_related("author").get(voice_id=voice_id, voice_type__key="post", is_active=True)
    comments = list(Voice.objects.filter(thread=post, is_active=True).select_related("author")[:limit])
    voices = [post, *_in_thread_order(post, comments)]
    ids = [v.voice_id for v in voices]
    readings = newest_readings(ids)
    topics = dict(
        Embedding.objects.filter(voice_id__in=ids, topic__isnull=False).values_list("voice_id", "topic__label")
    )
    return {
        "post": _voice_payload(post, readings.get(post.voice_id), topics.get(post.voice_id), post.author.handle),
        "voices": [
            _voice_payload(v, readings.get(v.voice_id), topics.get(v.voice_id), post.author.handle) for v in voices[1:]
        ],
    }


def _text_of(voice: Voice, length: int = MAP_TEXT_LENGTH) -> str:
    text = voice.title or voice.body_text
    return text if len(text) <= length else text[: length - 1] + "…"


def week_map(starts_on: date, limit: int = MAP_LIMIT) -> dict:
    """The flattened embeddings of a week: every projected point with its
    mood and topic, the week's topics, and the most-retrieved voices."""
    week = Week.objects.get(starts_on=starts_on)
    projected = (
        Embedding.objects.filter(voice__week=week, voice__is_active=True, x__isnull=False, y__isnull=False)
        .select_related("voice__author", "topic")
        .order_by("-retrieval_count", "voice__posted_at")[:limit]
    )
    points = list(projected)
    readings = newest_readings([e.voice_id for e in points])
    most_retrieved = (
        Embedding.objects.filter(voice__week=week, retrieval_count__gt=0)
        .select_related("voice__author")
        .order_by("-retrieval_count")[:MOST_RETRIEVED_LIMIT]
    )
    return {
        "points": [
            {
                "voice_id": str(e.voice_id),
                "x": e.x,
                "y": e.y,
                "mood": readings[e.voice_id].mood.key if e.voice_id in readings else None,
                "topic": e.topic.label if e.topic else None,
                "text": _text_of(e.voice),
                "retrievals": e.retrieval_count,
            }
            for e in points
        ],
        "topics": [{"label": t.label, "summary": t.summary, "size": t.size, "rank": t.rank} for t in week.topics.all()],
        "most_retrieved": [
            {
                "voice_id": str(e.voice_id),
                "handle": e.voice.author.handle,
                "text": _text_of(e.voice),
                "external_url": e.voice.external_url,
                "retrievals": e.retrieval_count,
            }
            for e in most_retrieved
        ],
    }
