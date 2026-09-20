"""Ingest (rss): the same voices straight from reddit.com's own feeds — no
credentials, the newest 25 posts and 100 comments, polite about 429s.
Comments arrive without score or parent and are relinked when the archive
run catches up."""

import requests

from pipelines.shared.services.reddit import shape_rss_entries
from pipelines.shared.services.runner import Context

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) steeler-voices/0.1"
FEEDS = {
    "post": "https://www.reddit.com/r/{sub}/new.rss?limit=25",
    "comment": "https://www.reddit.com/r/{sub}/comments.rss?limit=100",
}


def fetch_feed(url: str, session: requests.Session) -> str | None:
    response = session.get(url, timeout=30)
    if response.status_code == 429:
        return None
    response.raise_for_status()
    return response.text


def ingest_rss(context: Context) -> dict:
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT
    counts = {"fetched": 0, "posted": 0, "new": 0, "updated": 0, "unchanged": 0, "orphans": 0, "rate_limited": 0}
    for kind, template in FEEDS.items():
        xml_text = fetch_feed(template.format(sub=context.config.subreddit), session)
        if xml_text is None:
            counts["rate_limited"] += 1
            context.log.warning("%s feed answered 429; next firing is the retry", kind)
            continue
        voices = shape_rss_entries(xml_text, kind)
        counts["fetched"] += len(voices)
        if context.dry_run or not voices:
            counts["posted"] += len(voices)
            continue
        result = context.backend.ingest_voices(context.config.source_label, context.run_id, voices)
        counts["posted"] += len(voices)
        for key in ("new", "updated", "unchanged", "orphans"):
            counts[key] += result.get(key, 0)
    return counts
