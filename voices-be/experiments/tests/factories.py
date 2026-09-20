import factory

from experiments.models import Assignment, Experiment, Outcome, Variant
from lookups.models import LKExperimentKinds
from lookups.tests.factories import MetricFactory


class ExperimentKindFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LKExperimentKinds
        django_get_or_create = ("key",)

    key = "generation"
    label = factory.LazyAttribute(lambda o: o.key)


class ExperimentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Experiment
        django_get_or_create = ("key",)

    key = "rag-vs-baseline"
    kind = factory.SubFactory(ExperimentKindFactory)


class VariantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Variant
        django_get_or_create = ("experiment", "key")

    experiment = factory.SubFactory(ExperimentFactory)
    key = "rag"


class AssignmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Assignment

    experiment = factory.SubFactory(ExperimentFactory)
    variant = factory.SubFactory(VariantFactory)
    subject_type = "generation_run"
    subject_id = factory.Faker("uuid4")


class OutcomeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Outcome

    assignment = factory.SubFactory(AssignmentFactory)
    metric = factory.SubFactory(MetricFactory)
    value = 0.9
