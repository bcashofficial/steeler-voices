"""Entrypoint: `python -m pipelines.schedule.main [--dry-run]`."""

from pipelines.schedule.services import schedule
from pipelines.shared.services.runner import main

if __name__ == "__main__":
    main("schedule", schedule)
