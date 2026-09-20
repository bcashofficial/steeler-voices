from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response

from pipelines import services
from pipelines.models import PipelineRun
from pipelines.serializers import FinishRunSerializer, StartRunSerializer
from shared.decorators import voices_api_view, voices_internal_api_view


def run_payload(run: PipelineRun) -> dict:
    return {
        "pipeline_run_id": str(run.pipeline_run_id),
        "pipeline": run.pipeline.key,
        "host": run.host,
        "dry_run": run.dry_run,
        "started_at": run.started_at,
        "finished_at": run.finished_at,
        "exit_code": run.exit_code,
        "counts": run.counts,
    }


@voices_internal_api_view(["POST"])
def start_run(request):
    data = StartRunSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    run = services.start_run(**data.validated_data)
    return Response(run_payload(run), status=status.HTTP_201_CREATED)


@voices_internal_api_view(["PATCH"])
def finish_run(request, pipeline_run_id):
    run = get_object_or_404(PipelineRun, pk=pipeline_run_id)
    data = FinishRunSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    return Response(run_payload(services.finish_run(run, **data.validated_data)))


@voices_api_view(["GET"])
def list_pipelines(_request):
    rows = [
        {
            "key": row["pipeline"].key,
            "label": row["pipeline"].label,
            "description": row["pipeline"].description,
            "local_schedule": row["pipeline"].local_schedule,
            "remote_schedule": row["pipeline"].remote_schedule,
            "last_run": run_payload(row["last_run"]) if row["last_run"] else None,
        }
        for row in services.pipelines_with_last_run()
    ]
    return Response({"pipelines": rows})
