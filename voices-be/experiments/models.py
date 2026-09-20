"""One experiments app for two uses: the generation A/B (a subject is a
generation run) and UI variants (a subject is a browser session)."""

from django.db import models

from lookups.models import LKExperimentKinds, LKMetrics
from shared.models import TimeStampedModel, uuid_pk

SUBJECT_TYPE_CHOICES = [("session", "session"), ("generation_run", "generation_run")]


class Experiment(TimeStampedModel):
    experiment_id = uuid_pk()
    key = models.CharField(max_length=64, unique=True)
    kind = models.ForeignKey(LKExperimentKinds, related_name="experiments", on_delete=models.PROTECT)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.key


class Variant(TimeStampedModel):
    variant_id = uuid_pk()
    experiment = models.ForeignKey(Experiment, related_name="variants", on_delete=models.CASCADE)
    key = models.CharField(max_length=64)
    weight = models.IntegerField(default=1)
    config = models.JSONField(default=dict, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["experiment", "key"], name="uniq_variant_per_experiment")]

    def __str__(self):
        return f"{self.experiment.key}/{self.key}"


class Assignment(TimeStampedModel):
    """Which variant a subject got. A subject is assigned once per experiment."""

    assignment_id = uuid_pk()
    experiment = models.ForeignKey(Experiment, related_name="assignments", on_delete=models.CASCADE)
    variant = models.ForeignKey(Variant, related_name="assignments", on_delete=models.CASCADE)
    subject_type = models.CharField(max_length=32, choices=SUBJECT_TYPE_CHOICES)
    subject_id = models.CharField(max_length=64)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["experiment", "subject_type", "subject_id"], name="uniq_assignment_per_subject"
            ),
        ]


class Outcome(TimeStampedModel):
    """One measurement of one assignment on one metric."""

    outcome_id = uuid_pk()
    assignment = models.ForeignKey(Assignment, related_name="outcomes", on_delete=models.CASCADE)
    metric = models.ForeignKey(LKMetrics, related_name="outcomes", on_delete=models.PROTECT)
    value = models.FloatField()
    note = models.TextField(blank=True, default="")
    recorded_at = models.DateTimeField(auto_now_add=True)
