import pytest
from django.core.management import call_command

from voices.tests.factories import VoiceFactory


@pytest.mark.django_db
def test_status_and_vocab_are_public(api_client):
    call_command("seed_lookups")
    VoiceFactory()
    assert api_client.get("/api/status/").data["voices"] == 1
    vocab = api_client.get("/api/vocab/").data
    assert [m["key"] for m in vocab["moods"]] == [
        "hyped",
        "hopeful",
        "proud",
        "level",
        "uneasy",
        "frustrated",
        "heated",
    ]
    assert len(vocab["targets"]) == 8
