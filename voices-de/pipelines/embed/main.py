"""Entrypoint: `python -m pipelines.embed.main [--dry-run]`."""

from pipelines.embed.services import embed
from pipelines.shared.services.runner import main

if __name__ == "__main__":
    main("embed", embed)
