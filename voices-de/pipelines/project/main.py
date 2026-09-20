"""Entrypoint: `python -m pipelines.project.main [--dry-run]`."""

from pipelines.project.services import project
from pipelines.shared.services.runner import main

if __name__ == "__main__":
    main("project", project)
