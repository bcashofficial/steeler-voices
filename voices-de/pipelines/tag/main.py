"""Entrypoint: `python -m pipelines.tag.main [--dry-run] [--limit N]`."""

import sys

from pipelines.shared.services.runner import main
from pipelines.tag.services import PAGE, tag


def limit_arg() -> int:
    args = sys.argv[1:]
    return int(args[args.index("--limit") + 1]) if "--limit" in args else PAGE


if __name__ == "__main__":
    limit = limit_arg()
    main("tag", lambda context: tag(context, limit=limit))
