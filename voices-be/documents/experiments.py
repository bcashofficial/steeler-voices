"""The generation A/B as rows of the experiments app: one experiment,
one variant per arm, an assignment per generation run, and an outcome per
metric once the run has been scored.
"""

from django.db import transaction

from documents.models import GenerationRun
from experiments.models import Assignment, Experiment, Outcome, Variant
from lookups.models import LKArms, LKExperimentKinds, LKMetrics

EXPERIMENT_KEY = "generation"


def generation_experiment() -> Experiment:
    kind = LKExperimentKinds.objects.get(key="generation")
    experiment, _ = Experiment.objects.get_or_create(
        key=EXPERIMENT_KEY,
        defaults={"kind": kind, "description": "The same graph with retrieval on and off."},
    )
    for arm in LKArms.objects.filter(is_active=True):
        Variant.objects.get_or_create(
            experiment=experiment, key=arm.key, defaults={"config": {"uses_retrieval": arm.uses_retrieval}}
        )
    return experiment


@transaction.atomic
def assign(run: GenerationRun) -> Assignment:
    """The run's arm is its variant; a run is assigned once."""
    experiment = generation_experiment()
    assignment, _ = Assignment.objects.get_or_create(
        experiment=experiment,
        subject_type="generation_run",
        subject_id=str(run.generation_run_id),
        defaults={"variant": Variant.objects.get(experiment=experiment, key=run.arm.key)},
    )
    if run.assignment_id != assignment.assignment_id:
        run.assignment = assignment
        run.save(update_fields=["assignment", "updated_at"])
    return assignment


@transaction.atomic
def record_outcomes(run: GenerationRun, scores: dict[str, float]) -> int:
    """One outcome per known metric; unknown keys are ignored."""
    metrics = {m.key: m for m in LKMetrics.objects.filter(key__in=scores.keys())}
    written = 0
    for key, value in scores.items():
        if key in metrics:
            Outcome.objects.create(assignment=run.assignment, metric=metrics[key], value=value)
            written += 1
    return written
