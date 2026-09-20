"""Generation runs are requested by the generate pipeline and executed by
the graph inside this service; requesting creates one pending run per arm."""

from django.conf import settings
from django.db import transaction

from documents.models import GenerationRun
from lookups.models import LKArms
from pipelines.models import PipelineRun
from voices.models import Week

GRAPH_VERSION = "v1"


@transaction.atomic
def request_generation(week_start, arms: list[LKArms], run: PipelineRun | None) -> list[GenerationRun]:
    week = Week.objects.get(starts_on=week_start)
    return [
        GenerationRun.objects.create(
            week=week,
            arm=arm,
            model=settings.OLLAMA_GENERATION_MODEL,
            graph_version=GRAPH_VERSION,
            pipeline_run=run,
        )
        for arm in arms
    ]
