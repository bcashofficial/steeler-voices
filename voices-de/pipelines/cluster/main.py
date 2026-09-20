"""Entrypoint: `python -m pipelines.cluster.main [--dry-run] [--week YYYY-MM-DD]`."""

import sys
from datetime import date

from pipelines.cluster.services import cluster
from pipelines.shared.services.runner import main


def week_arg() -> date | None:
    args = sys.argv[1:]
    return date.fromisoformat(args[args.index("--week") + 1]) if "--week" in args else None


if __name__ == "__main__":
    week = week_arg()
    main("cluster", lambda context: cluster(context, week))
