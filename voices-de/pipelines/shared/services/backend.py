"""The one door into voices-be: every write a pipeline makes goes through
this client to an /api/internal/ endpoint behind the shared key. Nothing
here knows a table."""

from datetime import date
from typing import Any

import requests

from pipelines.shared.services.config import Settings

TIMEOUT = 120


class BackendClient:
    def __init__(self, config: Settings, session: requests.Session | None = None):
        self.base = config.backend_url
        self.session = session or requests.Session()
        self.session.headers["X-Internal-API-Key"] = config.internal_api_key

    def _request(self, method: str, path: str, **kwargs) -> Any:
        response = self.session.request(method, f"{self.base}{path}", timeout=TIMEOUT, **kwargs)
        response.raise_for_status()
        return response.json() if response.content else None

    # runs
    def start_run(self, pipeline: str, host: str, dry_run: bool) -> str:
        body = {"pipeline": pipeline, "host": host, "dry_run": dry_run}
        return self._request("POST", "/api/internal/pipelines/runs/", json=body)["pipeline_run_id"]

    def finish_run(self, run_id: str, exit_code: int, counts: dict, log_excerpt: str = "") -> None:
        body = {"exit_code": exit_code, "counts": counts, "log_excerpt": log_excerpt}
        self._request("PATCH", f"/api/internal/pipelines/runs/{run_id}/", json=body)

    # reads
    def status(self) -> dict:
        return self._request("GET", "/api/status/")

    def vocab(self) -> dict:
        return self._request("GET", "/api/vocab/")

    def pipelines(self) -> list[dict]:
        return self._request("GET", "/api/pipelines/")["pipelines"]

    def pending(self, need: str, limit: int, week: date | None = None) -> list[dict]:
        params = {"need": need, "limit": limit}
        if week:
            params["week"] = week.isoformat()
        return self._request("GET", "/api/internal/voices/pending/", params=params)["voices"]

    def embeddings(self, week: date | None, limit: int, offset: int) -> list[dict]:
        params = {"limit": limit, "offset": offset}
        if week:
            params["week"] = week.isoformat()
        return self._request("GET", "/api/internal/embeddings/list/", params=params)["embeddings"]

    # writes
    def ingest_voices(self, source: str, run_id: str | None, items: list[dict]) -> dict:
        return self._request("POST", "/api/internal/voices/", json={"source": source, "run": run_id, "items": items})

    def upsert_embeddings(self, run_id: str | None, model: str, items: list[dict]) -> dict:
        return self._request("POST", "/api/internal/embeddings/", json={"run": run_id, "model": model, "items": items})

    def apply_projection(self, run_id: str | None, items: list[dict]) -> dict:
        return self._request("POST", "/api/internal/projections/", json={"run": run_id, "items": items})

    def upsert_readings(self, run_id: str, model: str, prompt_version: str, items: list[dict]) -> dict:
        body = {"run": run_id, "model": model, "prompt_version": prompt_version, "items": items}
        return self._request("POST", "/api/internal/readings/", json=body)

    def replace_topics(self, run_id: str | None, week: date, topics: list[dict]) -> dict:
        return self._request(
            "POST", "/api/internal/topics/", json={"run": run_id, "week": week.isoformat(), "topics": topics}
        )

    def upsert_games(self, items: list[dict]) -> dict:
        return self._request("POST", "/api/internal/games/", json={"items": items})

    def request_generation(self, run_id: str | None, week: date, arms: list[str]) -> dict:
        return self._request(
            "POST", "/api/internal/generate/", json={"run": run_id, "week": week.isoformat(), "arms": arms}
        )
