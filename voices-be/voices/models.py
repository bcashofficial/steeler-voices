"""The community itself: every voice, who said it, which week it belongs to,
and what the machine has added to it (a vector, a reading, a topic).

Pipelines in voices-de write these rows through internal endpoints; the app
only reads them.
"""

from django.contrib.postgres.fields import ArrayField
from django.db import models
from pgvector.django import HnswIndex, VectorField

from lookups.models import LKMoods, LKSources, LKTargets, LKVoiceTypes
from shared.models import SoftDeleteModel, TimeStampedModel, uuid_pk

EMBEDDING_DIMENSIONS = 384  # BAAI/bge-small-en-v1.5


class Week(TimeStampedModel):
    """One Tuesday-to-Monday span — the unit the document is written for."""

    week_id = uuid_pk()
    starts_on = models.DateField(unique=True)
    ends_on = models.DateField()
    season = models.IntegerField()
    label = models.CharField(max_length=80, blank=True, default="")

    class Meta:
        ordering = ["-starts_on"]

    def __str__(self):
        return f"week of {self.starts_on:%b %-d}"


class Game(TimeStampedModel):
    """A Steelers game inside a week — zero on a bye, its result filled in
    after the week's document has already been written."""

    game_id = uuid_pk()
    week = models.ForeignKey(Week, related_name="games", on_delete=models.CASCADE)
    espn_event_id = models.CharField(max_length=32, unique=True)
    opponent = models.CharField(max_length=80)
    opponent_abbreviation = models.CharField(max_length=8)
    kickoff_at = models.DateTimeField()
    is_home = models.BooleanField()
    venue = models.CharField(max_length=120, blank=True, default="")
    status = models.CharField(max_length=32, default="scheduled")
    steelers_score = models.IntegerField(null=True, blank=True)
    opponent_score = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["kickoff_at"]


class Author(TimeStampedModel):
    author_id = uuid_pk()
    source = models.ForeignKey(LKSources, related_name="authors", on_delete=models.PROTECT)
    handle = models.CharField(max_length=80)
    first_seen_at = models.DateTimeField()
    voice_count = models.IntegerField(default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["source", "handle"], name="uniq_author_per_source")]

    def __str__(self):
        return self.handle


class Voice(SoftDeleteModel):
    """A post or a comment. A post is the root of its thread; a comment
    points at that root (`thread`) and at whatever it answered (`parent`)."""

    voice_id = uuid_pk()
    source = models.ForeignKey(LKSources, related_name="voices", on_delete=models.PROTECT)
    voice_type = models.ForeignKey(LKVoiceTypes, related_name="voices", on_delete=models.PROTECT)
    external_id = models.CharField(max_length=32)
    external_url = models.URLField(max_length=500)
    thread = models.ForeignKey("self", null=True, blank=True, related_name="replies", on_delete=models.CASCADE)
    parent = models.ForeignKey("self", null=True, blank=True, related_name="children", on_delete=models.SET_NULL)
    depth = models.IntegerField(null=True, blank=True)
    author = models.ForeignKey(Author, related_name="voices", on_delete=models.PROTECT)
    title = models.TextField(blank=True, default="")
    body_text = models.TextField(blank=True, default="")
    body_html = models.TextField(blank=True, default="")
    flair = models.CharField(max_length=80, blank=True, default="")
    score = models.IntegerField(null=True, blank=True)
    reply_count = models.IntegerField(null=True, blank=True)
    posted_at = models.DateTimeField()
    first_seen_at = models.DateTimeField()
    last_seen_at = models.DateTimeField()
    content_hash = models.CharField(max_length=64)
    week = models.ForeignKey(Week, related_name="voices", on_delete=models.PROTECT)
    ingest_run = models.ForeignKey(
        "pipelines.PipelineRun", null=True, blank=True, related_name="ingested_voices", on_delete=models.SET_NULL
    )

    class Meta:
        ordering = ["-posted_at"]
        constraints = [models.UniqueConstraint(fields=["source", "external_id"], name="uniq_voice_per_source")]
        indexes = [
            models.Index(fields=["week", "posted_at"]),
            models.Index(fields=["thread", "posted_at"]),
        ]

    def __str__(self):
        return self.title or self.body_text[:60]


class Topic(TimeStampedModel):
    """A cluster of one week's embeddings, named by the batch tagger."""

    topic_id = uuid_pk()
    week = models.ForeignKey(Week, related_name="topics", on_delete=models.CASCADE)
    label = models.CharField(max_length=120)
    summary = models.TextField(blank=True, default="")
    centroid = VectorField(dimensions=EMBEDDING_DIMENSIONS)
    size = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    cluster_run = models.ForeignKey(
        "pipelines.PipelineRun", null=True, blank=True, related_name="topics", on_delete=models.SET_NULL
    )

    class Meta:
        ordering = ["week", "rank"]

    def __str__(self):
        return self.label


class Embedding(TimeStampedModel):
    """The voice's vector, its place on the 2-D map, and its topic. The
    projection lives here because it is a property of the vector."""

    embedding_id = uuid_pk()
    voice = models.OneToOneField(Voice, related_name="embedding", on_delete=models.CASCADE)
    vector = VectorField(dimensions=EMBEDDING_DIMENSIONS)
    model = models.CharField(max_length=80)
    source_text = models.TextField()
    x = models.FloatField(null=True, blank=True)
    y = models.FloatField(null=True, blank=True)
    topic = models.ForeignKey(Topic, null=True, blank=True, related_name="embeddings", on_delete=models.SET_NULL)
    retrieval_count = models.IntegerField(default=0)
    embed_run = models.ForeignKey(
        "pipelines.PipelineRun", null=True, blank=True, related_name="embeddings", on_delete=models.SET_NULL
    )
    projection_run = models.ForeignKey(
        "pipelines.PipelineRun", null=True, blank=True, related_name="projections", on_delete=models.SET_NULL
    )

    class Meta:
        indexes = [
            HnswIndex(
                name="embedding_vector_hnsw",
                fields=["vector"],
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"],
            ),
        ]


class Reading(TimeStampedModel):
    """What the batch tagger read in a voice. History is kept — one row per
    tagging run — and the app shows the newest."""

    reading_id = uuid_pk()
    voice = models.ForeignKey(Voice, related_name="readings", on_delete=models.CASCADE)
    mood = models.ForeignKey(LKMoods, related_name="readings", on_delete=models.PROTECT)
    intensity = models.FloatField()
    target = models.ForeignKey(LKTargets, related_name="readings", on_delete=models.PROTECT)
    sarcasm = models.BooleanField(default=False)
    gist = models.TextField(blank=True, default="")
    subjects = ArrayField(models.CharField(max_length=80), default=list, blank=True)
    model = models.CharField(max_length=80)
    prompt_version = models.CharField(max_length=32)
    raw = models.JSONField(default=dict)
    tag_run = models.ForeignKey("pipelines.PipelineRun", related_name="readings", on_delete=models.PROTECT)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["voice", "tag_run"], name="uniq_reading_per_run"),
            models.CheckConstraint(condition=models.Q(intensity__gte=0, intensity__lte=1), name="intensity_is_unit"),
        ]
