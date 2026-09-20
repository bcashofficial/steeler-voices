"""Run the generator.

    manage.py run_generations                 every pending run, once
    manage.py run_generations --week DATE     request both arms for the week, then run them
    manage.py run_generations --watch         keep running pending runs as they appear

The generate pipeline in voices-de only requests runs; this is what
executes them, as its own process next to the API so a document taking
minutes never holds a web worker.
"""

import time
from datetime import date

from django.core.management.base import BaseCommand

from documents import generator, services
from lookups.models import LKArms, LKPipelines
from pipelines import services as pipelines

POLL_SECONDS = 20
PIPELINE_KEY = "generate"


def report(runs, host: str) -> None:
    """A batch of executed runs is a pipeline run of its own, so the app's
    pipelines section shows the generator's last run like any other."""
    pipeline = LKPipelines.objects.filter(key=PIPELINE_KEY).first()
    if pipeline is None or not runs:
        return
    record = pipelines.start_run(pipeline, host, dry_run=False)
    counts = {
        "runs": len(runs),
        "succeeded": sum(run.status == "succeeded" for run in runs),
        "failed": sum(run.status == "failed" for run in runs),
        "retrievals": sum(run.retrievals.count() for run in runs),
    }
    pipelines.finish_run(record, 0 if counts["failed"] == 0 else 1, counts, "")


class Command(BaseCommand):
    help = "Execute pending generation runs (optionally requesting a week's first)."

    def add_arguments(self, parser):
        parser.add_argument("--week", type=date.fromisoformat, help="request both arms for this week's Tuesday")
        parser.add_argument("--watch", action="store_true", help="keep polling for pending runs")
        parser.add_argument("--host", default="local", help="where this runs, for the pipeline record")

    def handle(self, *args, **options):
        if options["week"]:
            runs = services.request_generation(options["week"], list(LKArms.objects.filter(is_active=True)), None)
            self.stdout.write(f"requested {len(runs)} runs for {options['week']}")
        deps = generator.live_dependencies()
        while True:
            runs = generator.execute_pending(deps)
            for run in runs:
                self.stdout.write(f"{run.arm.key} {run.week.starts_on} {run.status} {run.error}".strip())
            report(runs, options["host"])
            if not options["watch"]:
                return
            time.sleep(POLL_SECONDS)
