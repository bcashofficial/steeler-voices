"""What the generator writes: a run of the graph, the document it produced,
its sections and citations, and every retrieval the run made along the way.
"""

from django.db import models

from lookups.models import LKArms, LKSectionKinds
from shared.models import TimeStampedModel, uuid_pk

STATUS_CHOICES = [("pending", "pending"), ("running", "running"), ("succeeded", "succeeded"), ("failed", "failed")]


class GenerationRun(TimeStampedModel):
    """One pass of the LangGraph graph for one week on one arm. The graph's
    checkpoints live in this same database under `checkpoint_thread_id`."""

    generation_run_id = uuid_pk()
    week = models.ForeignKey("voices.Week", related_name="generation_runs", on_delete=models.PROTECT)
    arm = models.ForeignKey(LKArms, related_name="generation_runs", on_delete=models.PROTECT)
    model = models.CharField(max_length=80)
    graph_version = models.CharField(max_length=32)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    checkpoint_thread_id = models.CharField(max_length=64, blank=True, default="")
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    error = models.TextField(blank=True, default="")
    assignment = models.ForeignKey(
        "experiments.Assignment", null=True, blank=True, related_name="generation_runs", on_delete=models.SET_NULL
    )
    pipeline_run = models.ForeignKey(
        "pipelines.PipelineRun", null=True, blank=True, related_name="generation_runs", on_delete=models.SET_NULL
    )

    class Meta:
        ordering = ["-created_at"]


class Document(TimeStampedModel):
    document_id = uuid_pk()
    generation_run = models.OneToOneField(GenerationRun, related_name="document", on_delete=models.CASCADE)
    week = models.ForeignKey("voices.Week", related_name="documents", on_delete=models.PROTECT)
    arm = models.ForeignKey(LKArms, related_name="documents", on_delete=models.PROTECT)
    title = models.CharField(max_length=200)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["week", "arm"],
                condition=models.Q(is_published=True),
                name="one_published_document_per_week_arm",
            ),
        ]

    def __str__(self):
        return self.title


class Section(TimeStampedModel):
    """A section of the document. `claims` is the structured form the rubric
    scores: each claim names the citations that back it."""

    section_id = uuid_pk()
    document = models.ForeignKey(Document, related_name="sections", on_delete=models.CASCADE)
    kind = models.ForeignKey(LKSectionKinds, related_name="sections", on_delete=models.PROTECT)
    position = models.IntegerField()
    heading = models.CharField(max_length=200)
    body = models.TextField()
    claims = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["document", "position"]
        constraints = [models.UniqueConstraint(fields=["document", "position"], name="uniq_section_position")]


class Citation(TimeStampedModel):
    citation_id = uuid_pk()
    section = models.ForeignKey(Section, related_name="citations", on_delete=models.CASCADE)
    voice = models.ForeignKey("voices.Voice", related_name="citations", on_delete=models.CASCADE)
    rank = models.IntegerField()
    distance = models.FloatField()
    quote = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["section", "rank"]


class RetrievalEvent(TimeStampedModel):
    """Every embedding retrieved, every time — which node asked, with what,
    and what came back at what distance."""

    retrieval_event_id = uuid_pk()
    generation_run = models.ForeignKey(GenerationRun, related_name="retrievals", on_delete=models.CASCADE)
    node = models.CharField(max_length=64)
    query_text = models.TextField()
    voice = models.ForeignKey("voices.Voice", related_name="retrievals", on_delete=models.CASCADE)
    rank = models.IntegerField()
    distance = models.FloatField()
    retrieved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["voice", "retrieved_at"])]
