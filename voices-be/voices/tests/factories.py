import hashlib
from datetime import UTC, date, datetime

import factory

from lookups.tests.factories import MoodFactory, SourceFactory, TargetFactory, VoiceTypeFactory
from voices.models import EMBEDDING_DIMENSIONS, Author, Embedding, Reading, Topic, Voice, Week


class WeekFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Week
        django_get_or_create = ("starts_on",)

    starts_on = date(2026, 9, 15)
    ends_on = date(2026, 9, 21)
    season = 2026


class AuthorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Author
        django_get_or_create = ("source", "handle")

    source = factory.SubFactory(SourceFactory)
    handle = factory.Sequence(lambda n: f"fan{n}")
    first_seen_at = datetime(2026, 9, 15, tzinfo=UTC)


class VoiceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Voice

    source = factory.SubFactory(SourceFactory)
    voice_type = factory.SubFactory(VoiceTypeFactory)
    external_id = factory.Sequence(lambda n: f"v{n:06x}")
    external_url = factory.LazyAttribute(lambda o: f"https://www.reddit.com/r/steelers/comments/{o.external_id}/")
    author = factory.SubFactory(AuthorFactory)
    body_text = factory.Sequence(lambda n: f"voice {n}")
    posted_at = datetime(2026, 9, 16, 12, tzinfo=UTC)
    first_seen_at = factory.LazyAttribute(lambda o: o.posted_at)
    last_seen_at = factory.LazyAttribute(lambda o: o.posted_at)
    content_hash = factory.LazyAttribute(lambda o: hashlib.sha256(o.body_text.encode()).hexdigest())
    week = factory.SubFactory(WeekFactory)


class TopicFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Topic

    week = factory.SubFactory(WeekFactory)
    label = factory.Sequence(lambda n: f"topic {n}")
    centroid = [0.0] * EMBEDDING_DIMENSIONS


class EmbeddingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Embedding

    voice = factory.SubFactory(VoiceFactory)
    vector = [0.0] * EMBEDDING_DIMENSIONS
    model = "BAAI/bge-small-en-v1.5"
    source_text = factory.LazyAttribute(lambda o: o.voice.body_text)


class ReadingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Reading

    voice = factory.SubFactory(VoiceFactory)
    mood = factory.SubFactory(MoodFactory)
    intensity = 0.5
    target = factory.SubFactory(TargetFactory)
    model = "qwen3:4b-instruct"
    prompt_version = "v1"
    tag_run = factory.SubFactory("pipelines.tests.factories.PipelineRunFactory")
