"""Embed: a vector for every voice without one. fastembed runs the model
in-process on the CPU; the backend stores the vectors in pgvector."""

import functools

from pipelines.shared.services.reddit import batched
from pipelines.shared.services.runner import Context

PAGE = 500
BATCH = 64
MAX_CHARS = 2000


def clip(text: str) -> str:
    """Long posts are embedded by their opening; the rest is retrieval noise."""
    return text[:MAX_CHARS]


@functools.cache
def _model(model_name: str):
    from fastembed import TextEmbedding  # heavy import kept off the test path

    return TextEmbedding(model_name=model_name)


def embed_texts(model_name: str, texts: list[str]) -> list[list[float]]:
    return [vector.tolist() for vector in _model(model_name).embed(texts, batch_size=BATCH)]


def embed(context: Context, embedder=embed_texts) -> dict:
    counts = {"pending": 0, "embedded": 0, "written": 0}
    while True:
        pending = context.backend.pending("embedding", PAGE)
        if not pending:
            return counts
        counts["pending"] += len(pending)
        vectors = embedder(context.config.embedding_model, [clip(v["text"]) for v in pending])
        counts["embedded"] += len(vectors)
        if context.dry_run:
            return counts
        for batch in batched(list(zip(pending, vectors, strict=True)), 200):
            items = [{"voice_id": v["voice_id"], "vector": vec, "source_text": clip(v["text"])} for v, vec in batch]
            counts["written"] += context.backend.upsert_embeddings(
                context.run_id, context.config.embedding_model, items
            )["written"]
        context.log.info("embedded %d so far", counts["embedded"])
