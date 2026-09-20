"""The pipeline contract, in one place.

    run(name, work, dry_run)   announce the run to the backend, do the work,
                               report counts, exit 0 / 1 / 2

A pipeline's `work(context)` returns its counts. It raises to fail. The
runner never retries — the next scheduled firing is the retry — and a
single bad record is the pipeline's own business: log it, count it,
continue. An ingest that fetched a full page and wrote nothing new is
reported as it is; the counts make it visible.
"""

import logging
import sys
from collections.abc import Callable
from dataclasses import dataclass

from pipelines.shared.services.backend import BackendClient
from pipelines.shared.services.config import Misconfigured, Settings, settings

EXIT_OK, EXIT_FAILED, EXIT_MISCONFIGURED = 0, 1, 2

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", stream=sys.stdout)


@dataclass
class Context:
    name: str
    config: Settings
    backend: BackendClient
    run_id: str | None
    dry_run: bool
    log: logging.Logger


Work = Callable[[Context], dict]


def run(name: str, work: Work, dry_run: bool = False, announce: bool = True) -> int:
    """Run one pipeline to completion and return its exit code."""
    log = logging.getLogger(name)
    try:
        config = settings()
    except Misconfigured as error:
        log.error("misconfigured: %s", error)
        return EXIT_MISCONFIGURED
    backend = BackendClient(config)
    run_id = None
    if announce and not dry_run:
        run_id = backend.start_run(name, config.host, dry_run)
    context = Context(name, config, backend, run_id, dry_run, log)
    try:
        counts = work(context)
    except Exception:  # noqa: BLE001 — any failure is the run's failure
        log.exception("%s failed", name)
        if run_id:
            backend.finish_run(run_id, EXIT_FAILED, {}, "see logs")
        return EXIT_FAILED
    log.info("%s done %s", name, counts)
    if run_id:
        backend.finish_run(run_id, EXIT_OK, counts)
    return EXIT_OK


def main(name: str, work: Work) -> None:
    """The entrypoint every pipeline's main.py delegates to: `--dry-run` does
    the fetch and the mapping and skips every write."""
    dry_run = "--dry-run" in sys.argv[1:]
    sys.exit(run(name, work, dry_run=dry_run))
