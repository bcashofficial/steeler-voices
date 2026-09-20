"""Controlled vocabularies as `LK` lookup tables — FK'd by every other app,
seeded by `manage.py seed_lookups`, extended by adding a row, not a column.
"""

from django.db import models

from shared.models import LookupModel, uuid_pk


class LKSources(LookupModel):
    """Where voices come from: one row per community. The archive feeds are
    named here; reddit.com's own RSS feeds are derived from `url`."""

    source_id = uuid_pk()
    platform = models.CharField(max_length=40)
    community = models.CharField(max_length=80)
    url = models.URLField()
    posts_feed_url = models.URLField()
    comments_feed_url = models.URLField()


class LKVoiceTypes(LookupModel):
    voice_type_id = uuid_pk()
    key = models.CharField(max_length=32, unique=True)


class LKMoods(LookupModel):
    """The tagging taxonomy. `color_token` names the design-system token that
    paints this mood's pulse bar."""

    mood_id = uuid_pk()
    key = models.CharField(max_length=32, unique=True)
    description = models.TextField(blank=True, default="")
    color_token = models.CharField(max_length=40, blank=True, default="")


class LKTargets(LookupModel):
    """Who or what a voice is aimed at."""

    target_id = uuid_pk()
    key = models.CharField(max_length=32, unique=True)


class LKSectionKinds(LookupModel):
    section_kind_id = uuid_pk()
    key = models.CharField(max_length=32, unique=True)


class LKArms(LookupModel):
    """The generation arms of the A/B: the same graph, retrieval on or off."""

    arm_id = uuid_pk()
    key = models.CharField(max_length=32, unique=True)
    uses_retrieval = models.BooleanField()


class LKExperimentKinds(LookupModel):
    experiment_kind_id = uuid_pk()
    key = models.CharField(max_length=32, unique=True)


class LKMetrics(LookupModel):
    """What an experiment outcome may measure."""

    metric_id = uuid_pk()
    key = models.CharField(max_length=32, unique=True)
    unit = models.CharField(max_length=32, blank=True, default="")
    higher_is_better = models.BooleanField(default=True)


class LKPipelines(LookupModel):
    """Every scheduled job in voices-de, with both schedules it runs on so the
    app can show what fires locally and what would fire remotely."""

    pipeline_id = uuid_pk()
    key = models.CharField(max_length=32, unique=True)
    description = models.TextField(blank=True, default="")
    local_schedule = models.CharField(max_length=64)
    remote_schedule = models.CharField(max_length=64)
