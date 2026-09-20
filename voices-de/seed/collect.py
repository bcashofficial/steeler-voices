"""Capture r/steelers into raw JSONL — the seed week's source of truth.

Two phases, one process:

  backfill  every post and comment from SINCE onward, page by page
  follow    every FOLLOW_MINUTES, fetch what has appeared since the cursor

Both read the Arctic Shift archive (https://arctic-shift.photon-reddit.com),
a public Reddit archive with no credentials and a ~30 s lag behind live.
Rows are written verbatim — the raw record is the audit trail; shaping into
`Voice` rows is the ingest pipeline's job, not this script's.

Files (all under raw/):
  posts.jsonl · comments.jsonl   one Reddit object per line, deduped by id
  cursor.json                    the newest created_utc seen per kind; the
                                 process resumes from here after a restart
  collect.log                    what happened, when

Standard library only, so it runs before the project has a venv.
"""

from __future__ import annotations

import json
import logging
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime
from pathlib import Path

BASE_URL = "https://arctic-shift.photon-reddit.com/api"
SUBREDDIT = "steelers"
SINCE = datetime(2026, 8, 11, tzinfo=UTC)  # the Tuesday five weeks before the Patriots week
PAGE_SIZE = 100
POLITE_PAUSE_SECONDS = 1.0
FOLLOW_MINUTES = 10
USER_AGENT = "te-takehome-seed-collector/0.1"

RAW_DIR = Path(__file__).parent / "raw"
CURSOR_PATH = RAW_DIR / "cursor.json"
KINDS = ("posts", "comments")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.FileHandler(RAW_DIR / "collect.log"), logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("collect")


def load_cursor() -> dict[str, int]:
    if CURSOR_PATH.exists():
        return json.loads(CURSOR_PATH.read_text())
    return {kind: int(SINCE.timestamp()) for kind in KINDS}


def save_cursor(cursor: dict[str, int]) -> None:
    CURSOR_PATH.write_text(json.dumps(cursor, indent=2))


def load_seen_ids(kind: str) -> set[str]:
    path = RAW_DIR / f"{kind}.jsonl"
    if not path.exists():
        return set()
    with path.open() as handle:
        return {json.loads(line)["id"] for line in handle if line.strip()}


def fetch_page(kind: str, after_epoch: int) -> list[dict]:
    query = urllib.parse.urlencode({"subreddit": SUBREDDIT, "after": after_epoch, "limit": PAGE_SIZE, "sort": "asc"})
    request = urllib.request.Request(f"{BASE_URL}/{kind}/search?{query}", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)["data"]


def fetch_page_with_backoff(kind: str, after_epoch: int) -> list[dict]:
    delay = 5
    while True:
        try:
            return fetch_page(kind, after_epoch)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as error:
            log.warning("%s fetch failed after=%s (%s); retrying in %ss", kind, after_epoch, error, delay)
            time.sleep(delay)
            delay = min(delay * 2, 300)


def append_rows(kind: str, rows: list[dict], seen: set[str]) -> int:
    fresh = [row for row in rows if row["id"] not in seen]
    with (RAW_DIR / f"{kind}.jsonl").open("a") as handle:
        for row in fresh:
            handle.write(json.dumps(row, separators=(",", ":")) + "\n")
            seen.add(row["id"])
    return len(fresh)


def drain(kind: str, cursor: dict[str, int], seen: set[str]) -> int:
    """Pull every page newer than the cursor. Returns rows added."""
    added = 0
    while True:
        rows = fetch_page_with_backoff(kind, cursor[kind])
        if not rows:
            return added
        added += append_rows(kind, rows, seen)
        newest = max(row["created_utc"] for row in rows)
        # A page whose every row shares one second would loop forever; step past it.
        cursor[kind] = newest if newest > cursor[kind] else cursor[kind] + 1
        save_cursor(cursor)
        if len(rows) < PAGE_SIZE:
            return added
        time.sleep(POLITE_PAUSE_SECONDS)


def main() -> None:
    RAW_DIR.mkdir(exist_ok=True)
    cursor = load_cursor()
    seen = {kind: load_seen_ids(kind) for kind in KINDS}
    log.info("starting: cursor=%s already-have=%s", cursor, {k: len(v) for k, v in seen.items()})
    while True:
        for kind in KINDS:
            added = drain(kind, cursor, seen[kind])
            log.info(
                "%s +%d (total %d, cursor %s)",
                kind,
                added,
                len(seen[kind]),
                datetime.fromtimestamp(cursor[kind], tz=UTC).isoformat(),
            )
        time.sleep(FOLLOW_MINUTES * 60)


if __name__ == "__main__":
    main()
