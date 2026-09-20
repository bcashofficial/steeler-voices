"""Load seed: the committed capture of the community — six Tuesday weeks of
posts and comments, and the readings computed for them ahead of time — into
an empty backend, so the first boot has a whole season of voices before the
scheduler has fired once. Idempotent: the backend upserts."""

import gzip
import json
from pathlib import Path

from pipelines.shared.services.reddit import batched
from pipelines.shared.services.runner import Context

SEED_DIR = Path(__file__).resolve().parents[2] / "seed"
VOICES = SEED_DIR / "voices.jsonl.gz"
READINGS = SEED_DIR / "readings.jsonl.gz"
BATCH = 500


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with gzip.open(path, "rt") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def load_seed(context: Context) -> dict:
    voices = read_jsonl(VOICES)
    counts = {"voices": len(voices), "new": 0, "updated": 0, "unchanged": 0, "orphans": 0, "readings": 0}
    if context.dry_run:
        return counts
    for batch in batched(voices, BATCH):
        result = context.backend.ingest_voices(context.config.source_label, context.run_id, batch)
        for key in ("new", "updated", "unchanged", "orphans"):
            counts[key] += result.get(key, 0)
        context.log.info("loaded %d voices", counts["new"] + counts["updated"] + counts["unchanged"])
    counts["readings"] = load_readings(context, read_jsonl(READINGS))
    return counts


def load_readings(context: Context, readings: list[dict]) -> int:
    """Seed readings are keyed by the voice's external id — a fresh database
    mints its own UUIDs — so each is matched to its voice through the
    backend's pending list before it is written."""
    if not readings or not context.run_id:
        return 0
    by_external = {r["external_id"]: r for r in readings}
    items = [
        {**by_external[v["external_id"]], "voice_id": v["voice_id"]}
        for v in context.backend.pending("reading", 100000)
        if v["external_id"] in by_external
    ]
    written = 0
    for batch in batched(items, BATCH):
        payload = [{k: v for k, v in item.items() if k != "external_id"} for item in batch]
        written += context.backend.upsert_readings(context.run_id, "seed", "seed", payload)["written"]
    return written
