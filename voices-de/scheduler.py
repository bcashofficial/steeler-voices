"""The local schedule — what runs while `make dev` is up.

Reads every pipeline and its cron from the backend's registry (the same
table the app shows), loads the seed once into an empty store, then fires
each pipeline on its schedule as a subprocess so one crashing run never
takes the scheduler down. On a remote, EventBridge holds the same
schedules (see deploy/); this process is the local stand-in for it.
"""

import logging
import subprocess
import sys
import time

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from pipelines.shared.services.backend import BackendClient
from pipelines.shared.services.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", stream=sys.stdout)
log = logging.getLogger("scheduler")


def fire(key: str) -> int:
    log.info("firing %s", key)
    completed = subprocess.run([sys.executable, "-m", f"pipelines.{key}.main"], check=False)
    log.info("%s exited %d", key, completed.returncode)
    return completed.returncode


def wait_for_backend(backend: BackendClient, attempts: int = 60) -> dict:
    for _ in range(attempts):
        try:
            return backend.status()
        except Exception:  # noqa: BLE001 — the backend is still coming up
            time.sleep(2)
    raise SystemExit("backend never answered")


def main() -> None:
    config = settings()
    backend = BackendClient(config)
    status = wait_for_backend(backend)
    if status["voices"] == 0:
        fire("load_seed")
    scheduler = BlockingScheduler(job_defaults={"coalesce": True, "max_instances": 1, "misfire_grace_time": 300})
    for pipeline in backend.pipelines():
        cron = pipeline["local_schedule"]
        if cron in ("boot", "manual"):
            continue
        scheduler.add_job(fire, CronTrigger.from_crontab(cron), args=[pipeline["key"]], id=pipeline["key"])
        log.info("scheduled %s at %s", pipeline["key"], cron)
    scheduler.start()


if __name__ == "__main__":
    main()
