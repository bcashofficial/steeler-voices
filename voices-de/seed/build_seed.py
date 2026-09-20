"""Curate the raw capture into the committed seed.

Raw is everything (raw/posts.jsonl, raw/comments.jsonl). The seed is what
the store needs to be valuable on first boot without being large: every
usable post, and per thread the comments that carry the conversation —
the top TOP_PER_THREAD by score plus every comment above MIN_SCORE — with
deleted, removed and one-word voices dropped. Written as the voices
contract, gzipped, so load_seed POSTs it straight to the backend.

    python -m seed.build_seed            # writes seed/voices.jsonl.gz and prints the counts
"""

import gzip
import json
from collections import defaultdict
from pathlib import Path

from pipelines.shared.services.reddit import shape_archive_comment, shape_archive_post

HERE = Path(__file__).resolve().parent
RAW = HERE / "raw"
OUT = HERE / "voices.jsonl.gz"
TOP_PER_THREAD = 120
MIN_SCORE = 5
MIN_CHARS = 12


def read(path: Path):
    with path.open() as handle:
        for line in handle:
            if line.strip():
                yield json.loads(line)


def keep_comments(comments: list[dict]) -> list[dict]:
    """The conversation, not the noise: the thread's top comments by score
    plus anything that clearly landed, longer than a shrug."""
    long_enough = [c for c in comments if len(c.get("body", "")) >= MIN_CHARS]
    by_score = sorted(long_enough, key=lambda c: -(c.get("score") or 0))
    chosen = {c["id"] for c in by_score[:TOP_PER_THREAD]}
    chosen |= {c["id"] for c in long_enough if (c.get("score") or 0) >= MIN_SCORE}
    return [c for c in long_enough if c["id"] in chosen]


def build() -> dict:
    posts = [p for p in read(RAW / "posts.jsonl")]
    by_thread: dict[str, list[dict]] = defaultdict(list)
    for comment in read(RAW / "comments.jsonl"):
        by_thread[comment["link_id"].split("_", 1)[1]].append(comment)
    voices, counts = [], {"posts_raw": len(posts), "comments_raw": sum(map(len, by_thread.values()))}
    for post in posts:
        shaped = shape_archive_post(post)
        if shaped:
            voices.append(shaped)
        for comment in keep_comments(by_thread.get(post["id"], [])):
            shaped = shape_archive_comment(comment)
            if shaped:
                voices.append(shaped)
    voices.sort(key=lambda v: v["posted_at"])
    with gzip.open(OUT, "wt") as handle:
        for voice in voices:
            handle.write(json.dumps(voice, separators=(",", ":")) + "\n")
    counts["posts"] = sum(v["voice_type"] == "post" for v in voices)
    counts["comments"] = sum(v["voice_type"] == "comment" for v in voices)
    counts["bytes_gz"] = OUT.stat().st_size
    return counts


if __name__ == "__main__":
    print(json.dumps(build(), indent=2))
