"""Pipeline runs: a pipeline announces itself when it starts and reports
its counts when it finishes. The app reads this table for the schedule
view and its history."""

from django.utils import timezone

from lookups.models import LKPipelines
from pipelines.models import PipelineRun


def start_run(pipeline: LKPipelines, host: str, dry_run: bool) -> PipelineRun:
    return PipelineRun.objects.create(pipeline=pipeline, host=host, dry_run=dry_run, started_at=timezone.now())


def finish_run(run: PipelineRun, exit_code: int, counts: dict, log_excerpt: str) -> PipelineRun:
    run.exit_code = exit_code
    run.counts = counts
    run.log_excerpt = log_excerpt[-4000:]
    run.finished_at = timezone.now()
    run.save(update_fields=["exit_code", "counts", "log_excerpt", "finished_at", "updated_at"])
    return run


def pipelines_with_last_run() -> list[dict]:
    """Every scheduled pipeline with both schedules and its most recent run."""
    rows = []
    for pipeline in LKPipelines.objects.filter(is_active=True):
        last = pipeline.runs.order_by("-started_at").first()
        rows.append({"pipeline": pipeline, "last_run": last})
    return rows
