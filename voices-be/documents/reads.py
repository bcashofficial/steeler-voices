"""What the app reads of the generator's work: for a week, each arm's
document — the published one, else the newest — with its sections,
citations, run and scored outcomes, so the two arms can sit side by side.
"""

from datetime import date

from documents.models import Document, GenerationRun
from experiments.models import Outcome
from lookups.models import LKArms
from voices.models import Week


def _cited_indices(section) -> list[int]:
    """The evidence indices the section's citations were written for, in
    citation order: the store writes one citation per distinct valid index,
    ascending, and an invalid index is always past the valid ones."""
    indices = sorted({i for claim in section.claims for i in claim.get("evidence", [])})
    return indices[: section.citations.count()]


def _citation_payload(citation, evidence_index: int | None) -> dict:
    return {
        "evidence": evidence_index,
        "voice_id": str(citation.voice_id),
        "handle": citation.voice.author.handle,
        "external_url": citation.voice.external_url,
        "rank": citation.rank,
        "distance": citation.distance,
        "quote": citation.quote,
    }


def _section_payload(section) -> dict:
    return {
        "kind": section.kind.key,
        "position": section.position,
        "heading": section.heading,
        "body": section.body,
        "claims": section.claims,
        "citations": [
            _citation_payload(citation, index)
            for citation, index in zip(
                section.citations.select_related("voice__author"), _cited_indices(section), strict=False
            )
        ],
    }


def _run_payload(run: GenerationRun | None) -> dict | None:
    if run is None:
        return None
    return {
        "generation_run_id": str(run.generation_run_id),
        "status": run.status,
        "model": run.model,
        "graph_version": run.graph_version,
        "started_at": run.started_at,
        "finished_at": run.finished_at,
        "prompt_tokens": run.prompt_tokens,
        "completion_tokens": run.completion_tokens,
        "retrievals": run.retrievals.count(),
        "error": run.error,
    }


def _outcomes_for(run: GenerationRun | None) -> list[dict]:
    if run is None or run.assignment_id is None:
        return []
    rows = Outcome.objects.filter(assignment_id=run.assignment_id).select_related("metric").order_by("recorded_at")
    return [{"metric": o.metric.key, "label": o.metric.label, "unit": o.metric.unit, "value": o.value} for o in rows]


def _document_for(week: Week, arm: LKArms) -> Document | None:
    """The published document for the arm, else the newest one."""
    documents = Document.objects.filter(week=week, arm=arm).select_related("generation_run")
    return documents.filter(is_published=True).first() or documents.first()


def week_documents(starts_on: date) -> list[dict]:
    week = Week.objects.get(starts_on=starts_on)
    rows = []
    for arm in LKArms.objects.filter(is_active=True).order_by("-uses_retrieval"):
        document = _document_for(week, arm)
        run = document.generation_run if document else GenerationRun.objects.filter(week=week, arm=arm).first()
        rows.append(
            {
                "arm": arm.key,
                "label": arm.label,
                "uses_retrieval": arm.uses_retrieval,
                "title": document.title if document else None,
                "is_published": document.is_published if document else False,
                "sections": [_section_payload(s) for s in document.sections.select_related("kind")] if document else [],
                "run": _run_payload(run),
                "outcomes": _outcomes_for(run),
            }
        )
    return rows
