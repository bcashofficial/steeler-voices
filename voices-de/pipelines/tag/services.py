"""Tag: the batch reading of every voice without one. Twenty voices go to
the local model at a time with the closed vocabulary from the backend;
the model answers a JSON schema — mood, intensity, target, sarcasm, a
one-line gist, the subjects as the community names them — and each answer
is validated before it is written. A batch that fails to parse is retried
once, then skipped and counted; the next run picks those voices up."""

from pipelines.shared.services.ollama import OllamaClient
from pipelines.shared.services.reddit import batched
from pipelines.shared.services.runner import Context

PROMPT_VERSION = "v1"
PAGE = 200
BATCH = 20
MAX_CHARS = 1200

SYSTEM = (
    "You read posts and comments from r/steelers, the Pittsburgh Steelers community on Reddit. "
    "For each voice, give one reading. Use only the moods and targets you are given. "
    "intensity is 0 to 1: how hard the voice hits. sarcasm is true when the voice means the opposite of what it says. "
    "gist is one plain sentence of what the voice is saying. subjects are the people or things the voice is about, "
    "as the community names them, with nicknames expanded to full names where you are sure "
    "(JPJ is Joey Porter Jr., TJ is T.J. Watt). Answer only with JSON."
)


def schema(moods: list[str], targets: list[str]) -> dict:
    return {
        "type": "object",
        "properties": {
            "readings": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "mood": {"type": "string", "enum": moods},
                        "intensity": {"type": "number"},
                        "target": {"type": "string", "enum": targets},
                        "sarcasm": {"type": "boolean"},
                        "gist": {"type": "string"},
                        "subjects": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["id", "mood", "intensity", "target", "sarcasm", "gist", "subjects"],
                },
            }
        },
        "required": ["readings"],
    }


def prompt_for(batch: list[dict]) -> str:
    lines = [f"[{index}] {voice['text'][:MAX_CHARS]}" for index, voice in enumerate(batch)]
    return "Voices:\n\n" + "\n\n".join(lines)


def validate(answer: dict, batch: list[dict], moods: set[str], targets: set[str]) -> list[dict]:
    """Keep only readings that name a real voice in the batch with a real
    mood and target; clamp intensity; cap subjects."""
    items = []
    for reading in answer.get("readings", []):
        try:
            index = int(str(reading["id"]).strip("[]"))
            voice = batch[index]
        except (KeyError, ValueError, IndexError):
            continue
        if reading.get("mood") not in moods or reading.get("target") not in targets:
            continue
        intensity = float(reading.get("intensity", 0.5))
        items.append(
            {
                "voice_id": voice["voice_id"],
                "mood": reading["mood"],
                "intensity": max(0.0, min(1.0, intensity)),
                "target": reading["target"],
                "sarcasm": bool(reading.get("sarcasm", False)),
                "gist": str(reading.get("gist", ""))[:400],
                "subjects": [str(s)[:80] for s in reading.get("subjects", [])][:6],
                "raw": reading,
            }
        )
    return items


def tag(context: Context, client: OllamaClient | None = None) -> dict:
    vocab = context.backend.vocab()
    moods = [m["key"] for m in vocab["moods"]]
    targets = [t["key"] for t in vocab["targets"]]
    client = client or OllamaClient(context.config.ollama_base_url, context.config.tagging_model)
    if not client.is_up():
        raise RuntimeError(f"ollama is not reachable at {context.config.ollama_base_url}")
    counts = {"pending": 0, "read": 0, "written": 0, "failed_batches": 0}
    pending = context.backend.pending("reading", PAGE)
    counts["pending"] = len(pending)
    for batch in batched(pending, BATCH):
        items = read_batch(client, batch, moods, targets, context)
        if items is None:
            counts["failed_batches"] += 1
            continue
        counts["read"] += len(items)
        if not context.dry_run and items:
            result = context.backend.upsert_readings(
                context.run_id, context.config.tagging_model, PROMPT_VERSION, items
            )
            counts["written"] += result["written"]
    return counts


def read_batch(client: OllamaClient, batch: list[dict], moods: list[str], targets: list[str], context: Context):
    for attempt in (1, 2):
        try:
            answer = client.chat_json(SYSTEM, prompt_for(batch), schema(moods, targets))
            return validate(answer, batch, set(moods), set(targets))
        except (ValueError, KeyError, TypeError) as error:
            context.log.warning("batch failed to parse (attempt %d): %s", attempt, error)
    return None
