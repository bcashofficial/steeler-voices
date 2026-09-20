"""Cluster: this week's topics from its vectors. k-means on the unit
sphere (seeded, a handful of iterations), k from the week's size, each
cluster named by the local model from its most central voices. The week's
topics are replaced whole."""

from datetime import UTC, date, datetime, timedelta

import numpy as np

from pipelines.shared.services.ollama import OllamaClient
from pipelines.shared.services.runner import Context

PAGE = 2000
ITERATIONS = 12
MIN_VOICES = 12
EXAMPLES = 8
SYSTEM = (
    "You name topics of discussion on r/steelers, the Pittsburgh Steelers community on Reddit. "
    "Given voices from one cluster, answer with a short label (two to six words, as the community would say it) "
    "and a one-sentence summary. Answer only with JSON."
)
SCHEMA = {
    "type": "object",
    "properties": {"label": {"type": "string"}, "summary": {"type": "string"}},
    "required": ["label", "summary"],
}


def tuesday_week(moment: datetime) -> date:
    """The Tuesday opening the week containing `moment` (UTC is close enough
    for choosing which week to cluster; the backend owns the real rule)."""
    day = moment.date()
    return day - timedelta(days=(day.weekday() - 1) % 7)


def choose_k(n: int) -> int:
    return int(max(2, min(12, round((n / 40) ** 0.5) + 2)))


def kmeans(vectors: np.ndarray, k: int, seed: int = 7) -> tuple[np.ndarray, np.ndarray]:
    """Spherical k-means: cosine geometry on normalized rows."""
    rng = np.random.default_rng(seed)
    unit = vectors / np.maximum(np.linalg.norm(vectors, axis=1, keepdims=True), 1e-9)
    centers = unit[rng.choice(len(unit), size=k, replace=False)]
    labels = np.zeros(len(unit), dtype=int)
    for _ in range(ITERATIONS):
        labels = (unit @ centers.T).argmax(axis=1)
        for i in range(k):
            members = unit[labels == i]
            if len(members):
                center = members.mean(axis=0)
                centers[i] = center / max(np.linalg.norm(center), 1e-9)
    return labels, centers


def most_central(unit: np.ndarray, center: np.ndarray, ids: list[str], n: int) -> list[str]:
    order = np.argsort(-(unit @ center))[:n]
    return [ids[i] for i in order]


def fetch_week(context: Context, week: date) -> list[dict]:
    rows, offset = [], 0
    while True:
        page = context.backend.embeddings(week, PAGE, offset)
        rows.extend(page)
        if len(page) < PAGE:
            return rows
        offset += PAGE


def cluster(context: Context, week: date | None = None, client: OllamaClient | None = None) -> dict:
    week = week or tuesday_week(datetime.now(UTC))
    rows = fetch_week(context, week)
    counts = {"week": week.isoformat(), "embeddings": len(rows), "topics": 0, "assigned": 0}
    if len(rows) < MIN_VOICES:
        return counts
    vectors = np.array([row["vector"] for row in rows], dtype=np.float32)
    ids = [row["voice_id"] for row in rows]
    labels, centers = kmeans(vectors, choose_k(len(rows)))
    client = client or OllamaClient(context.config.ollama_base_url, context.config.tagging_model)
    lookup = {row["voice_id"]: row.get("text", "") for row in rows}
    topics = []
    unit = vectors / np.maximum(np.linalg.norm(vectors, axis=1, keepdims=True), 1e-9)
    for i, center in enumerate(centers):
        member_ids = [voice_id for voice_id, label in zip(ids, labels, strict=True) if label == i]
        if not member_ids:
            continue
        examples = most_central(unit[labels == i], center, member_ids, EXAMPLES)
        named = name_cluster(client, [lookup.get(v, "") for v in examples])
        topics.append({**named, "centroid": center.tolist(), "voice_ids": member_ids})
    counts["topics"] = len(topics)
    if not context.dry_run:
        counts["assigned"] = context.backend.replace_topics(context.run_id, week, topics)["assigned"]
    return counts


def name_cluster(client: OllamaClient, examples: list[str]) -> dict:
    user = "Voices:\n\n" + "\n\n".join(f"- {text[:400]}" for text in examples if text)
    answer = client.chat_json(SYSTEM, user, SCHEMA)
    return {"label": str(answer.get("label", ""))[:120] or "untitled", "summary": str(answer.get("summary", ""))[:600]}
