"""Every run of every voices-de pipeline, reported by the pipeline itself.

An ingest that fetched a full page and wrote nothing new is a failure, not a
quiet success — `counts` is what makes that visible.
"""

from django.db import models

from lookups.models import LKPipelines
from shared.models import TimeStampedModel, uuid_pk

HOST_CHOICES = [("local", "local"), ("rig", "rig"), ("remote", "remote")]


class PipelineRun(TimeStampedModel):
    pipeline_run_id = uuid_pk()
    pipeline = models.ForeignKey(LKPipelines, related_name="runs", on_delete=models.PROTECT)
    host = models.CharField(max_length=16, choices=HOST_CHOICES, default="local")
    dry_run = models.BooleanField(default=False)
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField(null=True, blank=True)
    exit_code = models.IntegerField(null=True, blank=True)
    counts = models.JSONField(default=dict, blank=True)
    log_excerpt = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-started_at"]

    @property
    def succeeded(self) -> bool:
        return self.exit_code == 0
