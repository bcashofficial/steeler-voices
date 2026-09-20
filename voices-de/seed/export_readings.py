"""Export the readings a backend holds into the committed seed file, keyed
by each voice's external id so any fresh database can take them.

    BACKEND_URL=... INTERNAL_API_KEY=... python -m seed.export_readings
"""

import gzip
import json
from pathlib import Path

from pipelines.shared.services.backend import BackendClient
from pipelines.shared.services.config import settings

OUT = Path(__file__).resolve().parent / "readings.jsonl.gz"


def export() -> int:
    backend = BackendClient(settings())
    rows = backend._request("GET", "/api/internal/readings/export/")["readings"]
    with gzip.open(OUT, "wt") as handle:
        for row in rows:
            handle.write(json.dumps(row, separators=(",", ":")) + "\n")
    return len(rows)


if __name__ == "__main__":
    print(json.dumps({"readings": export(), "path": str(OUT)}))
