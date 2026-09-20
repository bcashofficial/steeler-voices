"""Ingest: the newest posts and comments from the Arctic Shift archive of
the subreddit, shaped and POSTed in batches. Stateless — each run reads a
window ending now (two hours by default, the whole history with --since),
and the backend's upsert makes overlap harmless."""

from datetime import UTC, datetime, timedelta

import requests

from pipelines.shared.services.reddit import batched, shape_archive_comment, shape_archive_post
from pipelines.shared.services.runner import Context

ARCHIVE = "https://arctic-shift.photon-reddit.com/api"
PAGE = 100
BATCH = 200
WINDOW = timedelta(hours=2)
USER_AGENT = "steeler-voices-ingest/0.1"


def fetch_pages(kind: str, subreddit: str, after: datetime, session: requests.Session):
    """Every row of `kind` newer than `after`, page by page, oldest first."""
    cursor = int(after.timestamp())
    while True:
        params = {"subreddit": subreddit, "after": cursor, "limit": PAGE, "sort": "asc"}
        response = session.get(f"{ARCHIVE}/{kind}/search", params=params, timeout=60)
        response.raise_for_status()
        rows = response.json()["data"]
        if not rows:
            return
        yield from rows
        newest = max(row["created_utc"] for row in rows)
        cursor = newest if newest > cursor else cursor + 1
        if len(rows) < PAGE:
            return


def shape(kind: str, rows) -> list[dict]:
    shaper = shape_archive_post if kind == "posts" else shape_archive_comment
    return [voice for voice in (shaper(row) for row in rows) if voice]


def ingest(context: Context, since: datetime | None = None) -> dict:
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT
    after = since or datetime.now(UTC) - WINDOW
    counts = {"fetched": 0, "posted": 0, "new": 0, "updated": 0, "unchanged": 0, "orphans": 0, "skipped": 0}
    for kind in ("posts", "comments"):
        rows = list(fetch_pages(kind, context.config.subreddit, after, session))
        voices = shape(kind, rows)
        counts["fetched"] += len(rows)
        counts["skipped"] += len(rows) - len(voices)
        for batch in batched(voices, BATCH):
            counts["posted"] += len(batch)
            if context.dry_run:
                continue
            result = context.backend.ingest_voices(context.config.source_label, context.run_id, batch)
            for key in ("new", "updated", "unchanged", "orphans"):
                counts[key] += result.get(key, 0)
        context.log.info("%s: %d rows, %d voices", kind, len(rows), len(voices))
    return counts
