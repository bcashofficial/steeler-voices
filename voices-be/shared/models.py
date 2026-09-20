"""Abstract base models shared by every app.

Each concrete model declares its own singular `<table>_id` UUID primary key
via `uuid_pk()`; these bases only add the common columns.
"""

import uuid

from django.db import models


def uuid_pk():
    """A singular, named UUID primary key — `voice_id = uuid_pk()`."""
    return models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteModel(TimeStampedModel):
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class LookupModel(models.Model):
    """A controlled vocabulary row. Subclasses add their `<table>_id` PK and
    any columns the vocabulary carries beyond its label."""

    label = models.CharField(max_length=80, unique=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ["sort_order", "label"]

    def __str__(self):
        return self.label
