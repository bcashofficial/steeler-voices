"""Entrypoint: `python -m pipelines.ingest.main [--dry-run] [--since YYYY-MM-DD]`."""

import sys
from datetime import UTC, datetime

from pipelines.ingest.services import ingest
from pipelines.shared.services.runner import main


def since_arg() -> datetime | None:
    args = sys.argv[1:]
    if "--since" in args:
        return datetime.fromisoformat(args[args.index("--since") + 1]).replace(tzinfo=UTC)
    return None


if __name__ == "__main__":
    since = since_arg()
    main("ingest", lambda context: ingest(context, since))
