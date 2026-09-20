import pytest
from django.db import IntegrityError

from voices.tests.factories import EmbeddingFactory, ReadingFactory, VoiceFactory


@pytest.mark.django_db
def test_a_voice_is_unique_per_source():
    first = VoiceFactory(external_id="abc123")
    with pytest.raises(IntegrityError):
        VoiceFactory(external_id="abc123", source=first.source)


@pytest.mark.django_db
def test_a_comment_knows_its_thread_and_parent():
    post = VoiceFactory(title="Game thread")
    reply = VoiceFactory(thread=post, parent=post, depth=1)
    assert list(post.replies.all()) == [reply]
    assert reply.parent == post


@pytest.mark.django_db
def test_embedding_round_trips_through_pgvector():
    embedding = EmbeddingFactory(vector=[0.5] * 384)
    embedding.refresh_from_db()
    assert len(embedding.vector) == 384
    assert embedding.vector[0] == pytest.approx(0.5)


@pytest.mark.django_db
def test_reading_intensity_is_bounded():
    with pytest.raises(IntegrityError):
        ReadingFactory(intensity=1.5)
