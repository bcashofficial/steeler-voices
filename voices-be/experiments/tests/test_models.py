import pytest
from django.db import IntegrityError

from experiments.tests.factories import AssignmentFactory, ExperimentFactory, OutcomeFactory


@pytest.mark.django_db
def test_a_subject_is_assigned_once_per_experiment():
    experiment = ExperimentFactory()
    AssignmentFactory(experiment=experiment, subject_id="run-1")
    with pytest.raises(IntegrityError):
        AssignmentFactory(experiment=experiment, subject_id="run-1")


@pytest.mark.django_db
def test_outcomes_are_queryable_across_metrics():
    assignment = AssignmentFactory()
    OutcomeFactory(assignment=assignment, value=0.9)
    assert assignment.outcomes.get().metric.key == "groundedness"
