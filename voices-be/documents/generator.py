"""Running a generation: a pending run becomes running, the graph runs to
the end under its own checkpoint thread, the run records its tokens and
its outcomes, and a failure is written on the run instead of raised. The
model, the embedder and the checkpointer are handed in, so a test runs
the same code with fakes.
"""

import logging
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver

from documents import experiments, retrieval
from documents.graph import Dependencies, build_graph
from documents.llm import OllamaClient
from documents.models import GenerationRun

log = logging.getLogger(__name__)


def database_uri() -> str:
    db = settings.DATABASES["default"]
    return f"postgresql://{db['USER']}:{db['PASSWORD']}@{db['HOST']}:{db.get('PORT') or 5432}/{db['NAME']}"


@contextmanager
def postgres_checkpointer() -> Iterator[PostgresSaver]:
    """The graph's memory, in our own Postgres; setup is idempotent."""
    with PostgresSaver.from_conn_string(database_uri()) as saver:
        saver.setup()
        yield saver


@contextmanager
def memory_checkpointer() -> Iterator[MemorySaver]:
    yield MemorySaver()


def live_dependencies() -> Dependencies:
    return Dependencies(
        model=OllamaClient(settings.OLLAMA_BASE_URL, settings.OLLAMA_GENERATION_MODEL),
        embed=retrieval.embed_query,
    )


@transaction.atomic
def claim_next() -> GenerationRun | None:
    """The oldest pending run, flipped to running under a row lock, so two
    executors — the compose service and a native command — never take the
    same run."""
    run = (
        GenerationRun.objects.select_for_update(skip_locked=True)
        .filter(status="pending")
        .select_related("week", "arm")
        .order_by("created_at")
        .first()
    )
    if run is not None:
        _start(run)
    return run


def _start(run: GenerationRun) -> None:
    run.status, run.started_at, run.error = "running", timezone.now(), ""
    run.checkpoint_thread_id = str(run.generation_run_id)
    run.save(update_fields=["status", "started_at", "error", "checkpoint_thread_id", "updated_at"])


def execute_run(run: GenerationRun, deps: Dependencies, checkpointer: Any) -> GenerationRun:
    if run.status != "running":
        _start(run)
    experiments.assign(run)
    try:
        graph = build_graph(deps, checkpointer)
        final = graph.invoke(
            {
                "run_id": str(run.generation_run_id),
                "week": run.week.starts_on.isoformat(),
                "uses_retrieval": run.arm.uses_retrieval,
            },
            config={"configurable": {"thread_id": run.checkpoint_thread_id}},
        )
    except Exception as error:  # noqa: BLE001 — the failure belongs on the run
        log.exception("generation %s failed", run.generation_run_id)
        run.status, run.error, run.finished_at = "failed", f"{type(error).__name__}: {error}"[:2000], timezone.now()
        run.save(update_fields=["status", "error", "finished_at", "updated_at"])
        return run
    usage = final.get("usage", {})
    run.prompt_tokens = usage.get("prompt_tokens", 0)
    run.completion_tokens = usage.get("completion_tokens", 0)
    run.status, run.finished_at = "succeeded", timezone.now()
    run.save(update_fields=["status", "finished_at", "prompt_tokens", "completion_tokens", "updated_at"])
    experiments.record_outcomes(run, final.get("scores", {}))
    return run


def execute_pending(deps: Dependencies | None = None) -> list[GenerationRun]:
    """Every pending run, oldest first, each claimed before it is executed,
    on the live model and checkpointer."""
    deps = deps or live_dependencies()
    finished = []
    while (run := claim_next()) is not None:
        with postgres_checkpointer() as checkpointer:
            finished.append(execute_run(run, deps, checkpointer))
    return finished
