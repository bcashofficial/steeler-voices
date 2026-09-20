import pytest
from django.conf import settings
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory

from shared.decorators import voices_api_view, voices_internal_api_view

factory = APIRequestFactory()


@voices_api_view(["GET"])
def public_view(_request):
    return Response({"ok": True})


@voices_api_view(["GET"])
def exploding_view(_request):
    raise RuntimeError("boom")


@voices_internal_api_view(["POST"])
def internal_view(_request):
    return Response({"ok": True})


def test_public_view_answers():
    assert public_view(factory.get("/")).status_code == 200


def test_unexpected_errors_become_a_500_envelope():
    response = exploding_view(factory.get("/"))
    assert response.status_code == 500
    assert response.data == {"error": "internal error"}


@pytest.mark.parametrize("key,expected", [(None, 401), ("wrong", 401), (settings.INTERNAL_API_KEY, 200)])
def test_internal_view_requires_the_shared_key(key, expected):
    headers = {"HTTP_X_INTERNAL_API_KEY": key} if key else {}
    assert internal_view(factory.post("/", **headers)).status_code == expected
