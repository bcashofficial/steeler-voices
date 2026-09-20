"""A week's documents, one row per arm: the published document or the newest."""

import pytest

from documents.tests.factories import CitationFactory, DocumentFactory, GenerationRunFactory, RetrievalEventFactory
from experiments.tests.factories import AssignmentFactory, OutcomeFactory
from lookups.tests.factories import ArmFactory, MetricFactory
from voices.tests.factories import WeekFactory

pytestmark = pytest.mark.django_db


def test_week_documents_one_row_per_arm(api_client):
    week = WeekFactory()
    rag = ArmFactory(key="rag", label="rag")
    baseline = ArmFactory(key="baseline", label="baseline", uses_retrieval=False)
    older = DocumentFactory(generation_run__week=week, generation_run__arm=rag, title="older")
    published = DocumentFactory(
        generation_run__week=week, generation_run__arm=rag, title="published", is_published=True
    )
    citation = CitationFactory(section__document=published, quote="Trade him.")
    RetrievalEventFactory(generation_run=published.generation_run)
    run = published.generation_run
    run.assignment = AssignmentFactory()
    run.status = "succeeded"
    run.save()
    OutcomeFactory(assignment=run.assignment, metric=MetricFactory(key="groundedness", unit="ratio"), value=0.8)
    GenerationRunFactory(week=week, arm=baseline, status="failed", error="ollama down")
    assert older.title == "older"

    rows = api_client.get("/api/weeks/2026-09-15/documents/").json()["documents"]
    assert [r["arm"] for r in rows] == ["rag", "baseline"]
    assert rows[0]["title"] == "published" and rows[0]["is_published"] is True
    assert rows[0]["sections"][0]["citations"][0]["quote"] == "Trade him."
    assert rows[0]["sections"][0]["citations"][0]["voice_id"] == str(citation.voice_id)
    assert rows[0]["run"]["retrievals"] == 1
    assert rows[0]["outcomes"] == [{"metric": "groundedness", "label": "groundedness", "unit": "ratio", "value": 0.8}]
    assert rows[1]["title"] is None and rows[1]["run"]["status"] == "failed"
    assert api_client.get("/api/weeks/2026-01-06/documents/").status_code == 404
