"""The generator: one LangGraph graph for both arms.

    brief → plan → retrieve → write → store → judge
                 └──────────────────┘   (the baseline skips retrieval)

Every node reads and returns plain state, so a run checkpoints in Postgres
after each step and a crashed run resumes where it stopped. The retrieval
arm asks the store the week's questions and writes from what comes back,
citing it; the baseline arm gets the same brief with no voices and writes
from that. Both are judged against the same sample of the week.
"""

from dataclasses import dataclass
from datetime import date
from typing import Any, Protocol, TypedDict

from django.db import transaction
from langgraph.graph import END, START, StateGraph

from documents import prompts, retrieval, scoring
from documents.brief import Brief, build_brief
from documents.llm import Usage
from documents.models import Citation, Document, GenerationRun, Section
from lookups.models import LKSectionKinds
from voices.models import Voice, Week

JUDGE_SAMPLE = 30
EVIDENCE_LIMIT = 40


class Model(Protocol):
    def chat_json(self, system: str, user: str, schema: dict) -> tuple[dict, Usage]: ...


class Embed(Protocol):
    def __call__(self, text: str) -> list[float]: ...


@dataclass
class Dependencies:
    model: Model
    embed: Embed


class GenerationState(TypedDict, total=False):
    run_id: str
    week: str
    uses_retrieval: bool
    brief: dict
    queries: list[str]
    evidence: list[dict]
    draft: dict
    document_id: str
    scores: dict
    usage: dict


def _usage(state: GenerationState, more: Usage) -> dict:
    prior = state.get("usage", {})
    return {
        "prompt_tokens": prior.get("prompt_tokens", 0) + more.prompt_tokens,
        "completion_tokens": prior.get("completion_tokens", 0) + more.completion_tokens,
    }


def section_kinds() -> list[dict]:
    rows = LKSectionKinds.objects.filter(is_active=True).order_by("sort_order")
    return [{"key": row.key, "label": row.label, "question": row.question} for row in rows]


def judge_sample(week: Week, limit: int = JUDGE_SAMPLE) -> list[dict]:
    """The same voices for every arm: the week's highest-scored, whatever was retrieved."""
    voices = (
        Voice.objects.filter(week=week, is_active=True)
        .exclude(body_text="", title="")
        .select_related("author")
        .order_by("-score")[:limit]
    )
    return [
        {"index": i, "handle": v.author.handle, "score": v.score, "text": f"{v.title}\n{v.body_text}".strip()}
        for i, v in enumerate(voices)
    ]


def claims_of(draft: dict) -> list[dict]:
    return [claim for section in draft["sections"] for claim in section["claims"]]


class Nodes:
    """The graph's steps, each reading and returning plain state."""

    def __init__(self, deps: Dependencies):
        self.deps = deps

    def brief(self, state: GenerationState) -> dict:
        return {"brief": build_brief(date.fromisoformat(state["week"])).__dict__}

    def plan(self, state: GenerationState) -> dict:
        return {"queries": Brief(**state["brief"]).queries() if state["uses_retrieval"] else []}

    def retrieve(self, state: GenerationState) -> dict:
        run = GenerationRun.objects.get(pk=state["run_id"])
        week = Week.objects.get(starts_on=state["week"])
        retrieval.forget(run)
        best: dict[str, dict] = {}
        for query in state["queries"]:
            hits = retrieval.nearest(week, self.deps.embed(query))
            retrieval.record(run, "retrieve", query, hits)
            for hit in hits:
                if hit.voice_id not in best or hit.distance < best[hit.voice_id]["distance"]:
                    best[hit.voice_id] = {**hit.__dict__, "query": query}
        ranked = sorted(best.values(), key=lambda e: e["distance"])[:EVIDENCE_LIMIT]
        return {"evidence": [{"index": i, **item} for i, item in enumerate(ranked)]}

    def write(self, state: GenerationState) -> dict:
        sections = section_kinds()
        draft, usage = self.deps.model.chat_json(
            prompts.WRITER_SYSTEM,
            prompts.writer_user(state["brief"], sections, state.get("evidence", [])),
            prompts.writer_schema([s["key"] for s in sections]),
        )
        return {"draft": draft, "usage": _usage(state, usage)}

    def store(self, state: GenerationState) -> dict:
        document = store_document(state)
        claims = claims_of(state["draft"])
        return {
            "document_id": str(document.document_id),
            "scores": {
                "groundedness": scoring.grounded_share(claims, len(state.get("evidence", []))),
                "specificity": scoring.specific_share(claims, Brief(**state["brief"]).entities()),
            },
        }

    def judge(self, state: GenerationState) -> dict:
        claims = [claim["text"] for claim in claims_of(state["draft"])]
        sample = judge_sample(Week.objects.get(starts_on=state["week"]))
        verdicts, usage = self.deps.model.chat_json(
            prompts.JUDGE_SYSTEM, prompts.judge_user(claims, sample), prompts.JUDGE_SCHEMA
        )
        supported = sum(1 for v in verdicts["verdicts"] if v["supported"] and 0 <= v["claim"] < len(claims))
        return {
            "scores": {**state["scores"], "judge_score": scoring.judge_score(supported, len(claims))},
            "usage": _usage(state, usage),
        }


def build_graph(deps: Dependencies, checkpointer: Any):
    nodes = Nodes(deps)
    graph = StateGraph(GenerationState)
    for name in ("brief", "plan", "retrieve", "write", "store", "judge"):
        graph.add_node(name, getattr(nodes, name))
    graph.add_edge(START, "brief")
    graph.add_edge("brief", "plan")
    graph.add_conditional_edges("plan", lambda s: "retrieve" if s["uses_retrieval"] else "write")
    graph.add_edge("retrieve", "write")
    graph.add_edge("write", "store")
    graph.add_edge("store", "judge")
    graph.add_edge("judge", END)
    return graph.compile(checkpointer=checkpointer)


@transaction.atomic
def store_document(state: GenerationState) -> Document:
    """The draft as rows: the document (published, unpublishing the arm's
    previous one), its sections in order, and a citation per cited voice.
    A run executed again writes its document again, not twice."""
    run = GenerationRun.objects.select_related("week", "arm").get(pk=state["run_id"])
    Document.objects.filter(generation_run=run).delete()
    Document.objects.filter(week=run.week, arm=run.arm, is_published=True).update(is_published=False)
    document = Document.objects.create(
        generation_run=run, week=run.week, arm=run.arm, title=state["draft"]["title"], is_published=True
    )
    kinds = {row.key: row for row in LKSectionKinds.objects.all()}
    evidence = state.get("evidence", [])
    for position, drafted in enumerate(state["draft"]["sections"]):
        section = Section.objects.create(
            document=document,
            kind=kinds[drafted["kind"]],
            position=position,
            heading=drafted["heading"],
            body=drafted["body"],
            claims=drafted["claims"],
        )
        cited = sorted({i for claim in drafted["claims"] for i in scoring.valid_citations(claim, len(evidence))})
        Citation.objects.bulk_create(
            [
                Citation(
                    section=section,
                    voice_id=evidence[i]["voice_id"],
                    rank=rank,
                    distance=evidence[i]["distance"],
                    quote=evidence[i]["text"][: prompts.EVIDENCE_CHARS],
                )
                for rank, i in enumerate(cited, start=1)
            ]
        )
    return document
