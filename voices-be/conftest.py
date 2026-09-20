"""Root pytest fixtures. Tests run against the compose Postgres (pgvector),
so `Embedding` and `Topic` vector columns are real."""

import pytest
from django.conf import settings
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def internal_client():
    client = APIClient()
    client.credentials(HTTP_X_INTERNAL_API_KEY=settings.INTERNAL_API_KEY)
    return client
