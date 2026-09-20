import factory

from lookups.models import LKArms, LKMetrics, LKMoods, LKPipelines, LKSources, LKTargets, LKVoiceTypes


class SourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKSources
        django_get_or_create = ("label",)

    label = "r/steelers"
    platform = "reddit"
    community = "steelers"
    url = "https://www.reddit.com/r/steelers"
    posts_feed_url = "https://example.test/posts"
    comments_feed_url = "https://example.test/comments"
    adapter = "archive"


class VoiceTypeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKVoiceTypes
        django_get_or_create = ("key",)

    key = "comment"
    label = factory.LazyAttribute(lambda o: o.key)


class MoodFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKMoods
        django_get_or_create = ("key",)

    key = factory.Sequence(lambda n: f"mood{n}")
    label = factory.LazyAttribute(lambda o: o.key)


class TargetFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKTargets
        django_get_or_create = ("key",)

    key = "player"
    label = factory.LazyAttribute(lambda o: o.key)


class ArmFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKArms
        django_get_or_create = ("key",)

    key = "rag"
    label = factory.LazyAttribute(lambda o: o.key)
    uses_retrieval = True


class MetricFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKMetrics
        django_get_or_create = ("key",)

    key = "groundedness"
    label = factory.LazyAttribute(lambda o: o.key)


class PipelineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKPipelines
        django_get_or_create = ("key",)

    key = "ingest"
    label = factory.LazyAttribute(lambda o: o.key)
    local_schedule = "*/10 * * * *"
    remote_schedule = "rate(10 minutes)"
