"""Generate: ask the backend for the week's document on both arms. The
graph runs inside the backend; this pipeline only requests the runs and
reports what it requested."""

from datetime import UTC, date, datetime

from pipelines.cluster.services import tuesday_week
from pipelines.shared.services.runner import Context

ARMS = ["rag", "baseline"]


def generate(context: Context, week: date | None = None) -> dict:
    week = week or tuesday_week(datetime.now(UTC))
    counts = {"week": week.isoformat(), "requested": 0}
    if context.dry_run:
        return counts
    result = context.backend.request_generation(context.run_id, week, ARMS)
    counts["requested"] = len(result["generation_runs"])
    return counts
