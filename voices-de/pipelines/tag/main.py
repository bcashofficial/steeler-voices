"""Entrypoint: `python -m pipelines.tag.main [--dry-run]`."""

from pipelines.shared.services.runner import main
from pipelines.tag.services import tag

if __name__ == "__main__":
    main("tag", tag)
