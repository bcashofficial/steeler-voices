"""The one door to the local model. Structured output only: every call
hands Ollama a JSON schema and gets JSON back, temperature zero."""

import json

import requests

TIMEOUT = 95  # under the rig proxy's 100-second ceiling; a longer call is a batch that is too big
USER_AGENT = "Mozilla/5.0 steeler-voices/0.1"  # the rig's proxy rejects bare tool agents


class OllamaClient:
    def __init__(self, base_url: str, model: str, session: requests.Session | None = None):
        self.base_url = base_url
        self.model = model
        self.session = session or requests.Session()
        self.session.headers["User-Agent"] = USER_AGENT

    def chat_json(self, system: str, user: str, schema: dict) -> dict:
        body = {
            "model": self.model,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            "format": schema,
            "stream": False,
            "options": {"temperature": 0},
        }
        response = self.session.post(f"{self.base_url}/api/chat", json=body, timeout=TIMEOUT)
        response.raise_for_status()
        return json.loads(response.json()["message"]["content"])

    def is_up(self) -> bool:
        try:
            return self.session.get(f"{self.base_url}/api/tags", timeout=5).ok
        except requests.RequestException:
            return False
