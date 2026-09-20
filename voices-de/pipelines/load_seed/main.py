"""Entrypoint: `python -m pipelines.load_seed.main [--dry-run]`."""

from pipelines.load_seed.services import load_seed
from pipelines.shared.services.runner import main

if __name__ == "__main__":
    main("load_seed", load_seed)
