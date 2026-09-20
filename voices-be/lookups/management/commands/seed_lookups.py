"""Seed the LK vocabularies. Idempotent: upserts by `key` (or `label` where a
table has no key). Run: `manage.py seed_lookups`.

Moods and section kinds are seeded from `vocab.py`, which is the single place
the taxonomy's words live; the design system mirrors it.
"""

from django.core.management.base import BaseCommand

from lookups import vocab
from lookups.models import (
    LKArms,
    LKExperimentKinds,
    LKMetrics,
    LKMoods,
    LKPipelines,
    LKSectionKinds,
    LKSources,
    LKTargets,
    LKVoiceTypes,
)


def upsert(model, rows, lookup="key"):
    """Create or update each row by its lookup field; returns the count."""
    for position, row in enumerate(rows):
        defaults = {"sort_order": position, **{k: v for k, v in row.items() if k != lookup}}
        model.objects.update_or_create(**{lookup: row[lookup]}, defaults=defaults)
    return len(rows)


class Command(BaseCommand):
    help = "Seed every LK lookup table (idempotent)."

    def handle(self, *args, **options):
        counts = {
            "sources": upsert(LKSources, vocab.SOURCES, lookup="label"),
            "voice types": upsert(LKVoiceTypes, vocab.VOICE_TYPES),
            "moods": upsert(LKMoods, vocab.MOODS),
            "targets": upsert(LKTargets, vocab.TARGETS),
            "section kinds": upsert(LKSectionKinds, vocab.SECTION_KINDS),
            "arms": upsert(LKArms, vocab.ARMS),
            "experiment kinds": upsert(LKExperimentKinds, vocab.EXPERIMENT_KINDS),
            "metrics": upsert(LKMetrics, vocab.METRICS),
            "pipelines": upsert(LKPipelines, vocab.PIPELINES),
        }
        for name, count in counts.items():
            self.stdout.write(f"{name}: {count}")
