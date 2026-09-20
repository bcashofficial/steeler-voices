from datetime import UTC, datetime

import factory

from lookups.tests.factories import PipelineFactory
from pipelines.models import PipelineRun


class PipelineRunFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PipelineRun

    pipeline = factory.SubFactory(PipelineFactory)
    started_at = datetime(2026, 9, 16, 12, tzinfo=UTC)
    finished_at = datetime(2026, 9, 16, 12, 1, tzinfo=UTC)
    exit_code = 0
    counts = {"fetched": 100, "new": 40, "updated": 60, "skipped": 0, "failed": 0}
