"""Every setting a pipeline reads, from the environment. A missing required
variable is a misconfiguration — exit code 2 — never a default that points
at localhost by accident."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[3]
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / ".env.development")


class Misconfigured(Exception):
    """Raised when a required setting is missing; the runner exits 2."""


def require(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise Misconfigured(f"{name} is required")
    return value


@dataclass(frozen=True)
class Settings:
    backend_url: str
    internal_api_key: str
    ollama_base_url: str
    tagging_model: str
    generation_model: str
    embedding_model: str
    subreddit: str
    source_label: str
    espn_team: str
    host: str


def settings() -> Settings:
    return Settings(
        backend_url=require("BACKEND_URL").rstrip("/"),
        internal_api_key=require("INTERNAL_API_KEY"),
        ollama_base_url=require("OLLAMA_BASE_URL").rstrip("/"),
        tagging_model=require("OLLAMA_TAGGING_MODEL"),
        generation_model=require("OLLAMA_GENERATION_MODEL"),
        embedding_model=require("EMBEDDING_MODEL"),
        subreddit=require("SUBREDDIT"),
        source_label=require("SOURCE_LABEL"),
        espn_team=require("ESPN_TEAM"),
        host=os.environ.get("PIPELINE_HOST", "local"),
    )
