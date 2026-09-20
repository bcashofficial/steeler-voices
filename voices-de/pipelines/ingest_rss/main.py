"""Entrypoint: `python -m pipelines.ingest_rss.main [--dry-run]`."""

from pipelines.ingest_rss.services import ingest_rss
from pipelines.shared.services.runner import main

if __name__ == "__main__":
    main("ingest_rss", ingest_rss)
