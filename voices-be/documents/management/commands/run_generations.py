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
from lookups.models import LKArms

POLL_SECONDS = 20


class Command(BaseCommand):
    help = "Execute pending generation runs (optionally requesting a week's first)."

    def add_arguments(self, parser):
        parser.add_argument("--week", type=date.fromisoformat, help="request both arms for this week's Tuesday")
        parser.add_argument("--watch", action="store_true", help="keep polling for pending runs")

    def handle(self, *args, **options):
        if options["week"]:
            runs = services.request_generation(options["week"], list(LKArms.objects.filter(is_active=True)), None)
            self.stdout.write(f"requested {len(runs)} runs for {options['week']}")
        deps = generator.live_dependencies()
        while True:
            for run in generator.execute_pending(deps):
                self.stdout.write(f"{run.arm.key} {run.week.starts_on} {run.status} {run.error}".strip())
            if not options["watch"]:
                return
            time.sleep(POLL_SECONDS)
