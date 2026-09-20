import factory

from documents.models import Citation, Document, GenerationRun, RetrievalEvent, Section
from lookups.models import LKSectionKinds
from lookups.tests.factories import ArmFactory
from voices.tests.factories import VoiceFactory, WeekFactory


class SectionKindFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKSectionKinds
        django_get_or_create = ("key",)

    key = "this_week"
    label = factory.LazyAttribute(lambda o: o.key)


class GenerationRunFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GenerationRun

    week = factory.SubFactory(WeekFactory)
    arm = factory.SubFactory(ArmFactory)
    model = "qwen3:8b"
    graph_version = "v1"


class DocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Document

    generation_run = factory.SubFactory(GenerationRunFactory)
    week = factory.LazyAttribute(lambda o: o.generation_run.week)
    arm = factory.LazyAttribute(lambda o: o.generation_run.arm)
    title = "Community Voices"


class SectionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Section

    document = factory.SubFactory(DocumentFactory)
    kind = factory.SubFactory(SectionKindFactory)
    position = factory.Sequence(lambda n: n)
    heading = "heading"
    body = "body"


class CitationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Citation

    section = factory.SubFactory(SectionFactory)
    voice = factory.SubFactory(VoiceFactory)
    rank = 1
    distance = 0.2


class RetrievalEventFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RetrievalEvent

    generation_run = factory.SubFactory(GenerationRunFactory)
    node = "retrieve"
    query_text = "what did fans say about the secondary"
    voice = factory.SubFactory(VoiceFactory)
    rank = 1
    distance = 0.2
