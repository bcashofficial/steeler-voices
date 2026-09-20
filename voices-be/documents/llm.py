"""The one door to the model: Ollama, structured output only. Every call
hands the model a JSON schema and gets JSON back at temperature zero, with
the token counts it reports.
"""

import json
from dataclasses import dataclass

import requests

TIMEOUT = 900  # a whole document from an 8B model on a CPU takes minutes
CONTEXT_TOKENS = 16384
USER_AGENT = "Mozilla/5.0 steeler-voices/0.1"  # the rig's proxy rejects bare tool agents


@dataclass(frozen=True)
class Usage:
    prompt_tokens: int = 0
    completion_tokens: int = 0

    def __add__(self, other: "Usage") -> "Usage":
        return Usage(self.prompt_tokens + other.prompt_tokens, self.completion_tokens + other.completion_tokens)


class OllamaClient:
    def __init__(self, base_url: str, model: str, session: requests.Session | None = None):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.session = session or requests.Session()
        self.session.headers["User-Agent"] = USER_AGENT

    def chat_json(self, system: str, user: str, schema: dict) -> tuple[dict, Usage]:
        body = {
            "model": self.model,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            "format": schema,
            "stream": False,
            "think": False,
            "options": {"temperature": 0, "num_ctx": CONTEXT_TOKENS},
        }
        response = self.session.post(f"{self.base_url}/api/chat", json=body, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()
        usage = Usage(data.get("prompt_eval_count", 0), data.get("eval_count", 0))
        return json.loads(data["message"]["content"]), usage
