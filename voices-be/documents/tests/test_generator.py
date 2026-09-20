"""The graph end to end on fakes: the retrieval arm asks the store and
cites what it finds, the baseline arm writes from the brief alone, both
are scored and assigned, and a failure lands on the run."""

from datetime import UTC, datetime

import pytest

from documents import generator
from documents.brief import Brief
from documents.graph import Dependencies
from documents.llm import Usage
from documents.models import Citation, Document, RetrievalEvent
from documents.scoring import grounded_share, judge_score, specific_share
from documents.tests.factories import GenerationRunFactory, SectionKindFactory
from experiments.models import Outcome
from experiments.tests.factories import ExperimentKindFactory
from lookups.tests.factories import ArmFactory, MetricFactory, SourceFactory, VoiceTypeFactory
from voices.models import EMBEDDING_DIMENSIONS, Embedding
from voices.tests.factories import EmbeddingFactory, VoiceFactory, WeekFactory

pytestmark = pytest.mark.django_db

UNIT = [1.0] + [0.0] * (EMBEDDING_DIMENSIONS - 1)


class FakeModel:
    """Writes one claim per section; the first cites evidence 0 when there is any."""

    def __init__(self):
        self.calls: list[str] = []

    def chat_json(self, system: str, user: str, schema: dict) -> tuple[dict, Usage]:
        self.calls.append(system[:20])
        if "verdicts" in schema.get("required", []):
            return {"verdicts": [{"claim": 0, "supported": True}, {"claim": 1, "supported": False}]}, Usage(50, 10)
        cited = [0] if "Evidence" in user else []
        return {
            "title": "Community Voices",
            "sections": [
                {
                    "kind": "this_week",
                    "heading": "This week",
                    "body": "Fans argued about Joey Porter Jr.",
                    "claims": [{"text": "Fans argued about Joey Porter Jr. all week.", "evidence": cited}],
                },
                {
                    "kind": "next_week",
                    "heading": "Next week",
                    "body": "The Patriots game.",
                    "claims": [{"text": "The game will dominate.", "evidence": []}],
                },
            ],
        }, Usage(500, 200)


def seed_vocab():
    SectionKindFactory(key="this_week", label="This week")
    SectionKindFactory(key="next_week", label="Next week")
    ExperimentKindFactory(key="generation")
    for key in ("groundedness", "specificity", "judge_score"):
        MetricFactory(key=key)
    SourceFactory()


def seed_week():
    week = WeekFactory()
    post = VoiceFactory(
        week=week,
        voice_type=VoiceTypeFactory(key="post"),
        title="Joey Porter Jr leaves steelers practice",
        score=439,
        reply_count=601,
        posted_at=datetime(2026, 9, 17, tzinfo=UTC),
    )
    EmbeddingFactory(voice=post, vector=UNIT, source_text=post.title)
    other = VoiceFactory(week=week, body_text="Watt my beloved", score=685)
    EmbeddingFactory(voice=other, vector=[0.0, 1.0] + [0.0] * (EMBEDDING_DIMENSIONS - 2))
    return week, post


def run_arm(key: str, uses_retrieval: bool, week, model=None):
    run = GenerationRunFactory(week=week, arm=ArmFactory(key=key, label=key, uses_retrieval=uses_retrieval))
    with generator.memory_checkpointer() as checkpointer:
        return generator.execute_run(run, Dependencies(model=model or FakeModel(), embed=lambda _: UNIT), checkpointer)


def test_retrieval_arm_retrieves_cites_scores_and_assigns():
    seed_vocab()
    week, post = seed_week()
    run = run_arm("rag", True, week)
    assert run.status == "succeeded" and run.prompt_tokens == 550 and run.completion_tokens == 210
    document = Document.objects.get(generation_run=run)
    assert document.is_published and document.sections.count() == 2
    citation = Citation.objects.get(section__document=document)
    assert citation.voice == post and citation.rank == 1
    assert RetrievalEvent.objects.filter(generation_run=run).exists()
    assert Embedding.objects.get(voice=post).retrieval_count >= 1
    assert run.assignment.variant.key == "rag"
    outcomes = {o.metric.key: o.value for o in Outcome.objects.filter(assignment=run.assignment)}
    assert outcomes == {"groundedness": 0.5, "specificity": 0.5, "judge_score": 3.0}


def test_baseline_arm_never_retrieves_and_is_not_grounded():
    seed_vocab()
    week, _ = seed_week()
    model = FakeModel()
    run = run_arm("baseline", False, week, model)
    assert run.status == "succeeded"
    assert not RetrievalEvent.objects.filter(generation_run=run).exists()
    assert Citation.objects.filter(section__document__generation_run=run).count() == 0
    outcomes = {o.metric.key: o.value for o in Outcome.objects.filter(assignment=run.assignment)}
    assert outcomes["groundedness"] == 0.0 and outcomes["judge_score"] == 3.0
    assert len(model.calls) == 2  # the writer and the judge, no more


def test_a_second_run_unpublishes_the_arms_previous_document():
    seed_vocab()
    week, _ = seed_week()
    first = run_arm("rag", True, week)
    second = run_arm("rag", True, week)
    assert Document.objects.get(generation_run=first).is_published is False
    assert Document.objects.get(generation_run=second).is_published is True


def test_a_failure_lands_on_the_run():
    seed_vocab()
    week, _ = seed_week()

    class Broken:
        def chat_json(self, *_):
            raise RuntimeError("ollama down")

    run = run_arm("rag", True, week, Broken())
    assert run.status == "failed" and "ollama down" in run.error
    assert not Document.objects.filter(generation_run=run).exists()


def test_scoring_arithmetic():
    claims = [{"text": "Fans argued about Joey Porter Jr.", "evidence": [0]}, {"text": "Nothing.", "evidence": [9]}]
    assert grounded_share(claims, evidence_count=3) == 0.5
    assert specific_share(claims, {"joey porter jr."}) == 0.5
    assert grounded_share([], 3) == 0.0
    assert judge_score(3, 4) == 4.0 and judge_score(0, 0) == 1.0


def test_brief_names_and_queries():
    brief = Brief(
        week_start="2026-09-15",
        week_end="2026-09-21",
        team="Steelers",
        game=None,
        posts=1,
        comments=0,
        titles=["Joey Porter Jr leaves steelers practice", "The Patriots game"],
        subjects=["Joey Porter Jr.", "Omar Khan"],
    )
    assert {"joey porter jr.", "omar khan", "joey", "porter", "patriots"} <= brief.entities()
    assert "the" not in brief.entities()
    assert brief.queries()[:2] == ["Joey Porter Jr.", "Omar Khan"]


def test_the_command_reports_its_batch_as_a_pipeline_run():
    from documents.management.commands.run_generations import report
    from lookups.tests.factories import PipelineFactory
    from pipelines.models import PipelineRun

    seed_vocab()
    week, _ = seed_week()
    PipelineFactory(key="generate")
    report([run_arm("rag", True, week), run_arm("baseline", False, week)], host="rig")
    record = PipelineRun.objects.get(pipeline__key="generate")
    assert record.host == "rig" and record.exit_code == 0
    assert record.counts["succeeded"] == 2 and record.counts["retrievals"] >= 1


def test_a_claimed_run_is_taken_once_and_a_rerun_rewrites_its_document():
    seed_vocab()
    week, _ = seed_week()
    run = GenerationRunFactory(week=week, arm=ArmFactory(key="rag", label="rag", uses_retrieval=True))
    assert generator.claim_next() == run
    assert generator.claim_next() is None  # running now, not pending
    with generator.memory_checkpointer() as checkpointer:
        deps = Dependencies(model=FakeModel(), embed=lambda _: UNIT)
        generator.execute_run(run, deps, checkpointer)
        generator.execute_run(run, deps, checkpointer)
    assert Document.objects.filter(generation_run=run).count() == 1
