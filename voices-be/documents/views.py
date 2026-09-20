from rest_framework import serializers as drf
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from documents import reads, services
from documents.serializers import RequestGenerationSerializer
from shared.decorators import voices_api_view, voices_internal_api_view
from voices.models import Week


def run_payload(run) -> dict:
    return {"generation_run_id": str(run.generation_run_id), "arm": run.arm.key, "status": run.status}


@voices_internal_api_view(["POST"])
def request_generation(request):
    data = RequestGenerationSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    valid = data.validated_data
    runs = services.request_generation(valid["week"], valid["arms"], valid.get("run"))
    return Response({"generation_runs": [run_payload(r) for r in runs]}, status=status.HTTP_201_CREATED)


@voices_api_view(["GET"])
def week_documents(_request, starts_on):
    try:
        return Response({"documents": reads.week_documents(drf.DateField().to_internal_value(starts_on))})
    except (drf.ValidationError, Week.DoesNotExist) as error:
        raise NotFound from error
