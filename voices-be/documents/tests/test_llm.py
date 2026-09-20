"""The model client asks again when a proxy cuts a long answer off."""

from unittest.mock import patch

import pytest
import requests

from documents.llm import OllamaClient


class Answer:
    def __init__(self, status: int, content: str = '{"ok": true}'):
        self.status_code = status
        self._content = content

    def raise_for_status(self):
        if self.status_code >= 400:
            error = requests.HTTPError(f"{self.status_code}")
            error.response = self
            raise error

    def json(self):
        return {"message": {"content": self._content}, "prompt_eval_count": 7, "eval_count": 3}


def test_retries_a_proxy_timeout_then_returns_the_answer():
    client = OllamaClient("http://model", "qwen3:8b")
    answers = iter([Answer(524), Answer(200)])
    with (
        patch.object(client.session, "post", side_effect=lambda *a, **k: next(answers)),
        patch("documents.llm.time.sleep"),
    ):
        data, usage = client.chat_json("s", "u", {})
    assert data == {"ok": True} and usage.prompt_tokens == 7


def test_does_not_retry_a_bad_request():
    client = OllamaClient("http://model", "qwen3:8b")
    with patch.object(client.session, "post", return_value=Answer(400)), pytest.raises(requests.HTTPError):
        client.chat_json("s", "u", {})
