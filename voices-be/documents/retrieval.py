"""Retrieval: a query embedded with the same model the pipelines used, then
the nearest voices of the week by cosine distance over pgvector's HNSW
index. Every hit is logged as a RetrievalEvent and counted on its
embedding, so the map can show which voices the generator leans on.
"""

import functools
from dataclasses import dataclass

from django.db import connection, transaction
from django.db.models import F
from pgvector.django import CosineDistance

from documents.models import GenerationRun, RetrievalEvent
from voices.models import EMBEDDING_DIMENSIONS, Embedding, Week

EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
HITS_PER_QUERY = 8


@functools.cache
def _model():
    from fastembed import TextEmbedding  # heavy import kept off every other path

    return TextEmbedding(model_name=EMBEDDING_MODEL)


def embed_query(text: str) -> list[float]:
    """The query's vector; the same 384 dimensions the voices carry."""
    vector = next(iter(_model().embed([text]))).tolist()
    assert len(vector) == EMBEDDING_DIMENSIONS
    return vector


@dataclass(frozen=True)
class Hit:
    voice_id: str
    handle: str
    text: str
    score: int | None
    distance: float


def _widen_index_scan() -> None:
    """A week is a sliver of the index, and an HNSW scan hands back its
    candidates before the week filter drops most of them. Iterative scans
    keep walking the graph until the limit is met; the settings only exist
    once the extension's library is loaded, hence the cast first."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT '[0]'::vector")
        cursor.execute("SET LOCAL hnsw.iterative_scan = 'relaxed_order'")
        cursor.execute("SET LOCAL hnsw.ef_search = 200")


def nearest(week: Week, vector: list[float], limit: int = HITS_PER_QUERY) -> list[Hit]:
    with transaction.atomic():
        _widen_index_scan()
        rows = list(
            Embedding.objects.filter(voice__week=week, voice__is_active=True)
            .select_related("voice__author")
            .annotate(distance=CosineDistance("vector", vector))
            .order_by("distance")[:limit]
        )
    return [Hit(str(e.voice_id), e.voice.author.handle, e.source_text, e.voice.score, float(e.distance)) for e in rows]


def record(run: GenerationRun, node: str, query: str, hits: list[Hit]) -> None:
    """Every retrieval, every time: the event rows and the running count."""
    RetrievalEvent.objects.bulk_create(
        [
            RetrievalEvent(
                generation_run=run, node=node, query_text=query, voice_id=hit.voice_id, rank=rank, distance=hit.distance
            )
            for rank, hit in enumerate(hits, start=1)
        ]
    )
    Embedding.objects.filter(voice_id__in=[hit.voice_id for hit in hits]).update(
        retrieval_count=F("retrieval_count") + 1
    )
