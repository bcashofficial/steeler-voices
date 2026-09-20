from rest_framework import serializers as drf
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from shared.decorators import voices_api_view, voices_internal_api_view
from voices import reads, serializers, services
from voices.models import Voice, Week


def _validated(serializer_class, data):
    serializer = serializer_class(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data


@voices_internal_api_view(["POST"])
def ingest_voices(request):
    data = _validated(serializers.IngestVoicesSerializer, request.data)
    return Response(services.ingest_voices(data["source"], data.get("run"), data["items"]))


@voices_internal_api_view(["GET"])
def pending_voices(request):
    data = _validated(serializers.PendingQuerySerializer, request.query_params)
    return Response({"voices": services.pending_voices(data["need"], data["limit"], data.get("week"))})


@voices_internal_api_view(["POST"])
def upsert_embeddings(request):
    data = _validated(serializers.UpsertEmbeddingsSerializer, request.data)
    return Response(services.upsert_embeddings(data.get("run"), data["model"], data["items"]))


@voices_internal_api_view(["GET"])
def list_embeddings(request):
    week = request.query_params.get("week")
    limit = min(int(request.query_params.get("limit", 2000)), 5000)
    offset = int(request.query_params.get("offset", 0))
    parsed = serializers.serializers.DateField().to_internal_value(week) if week else None
    return Response({"embeddings": services.list_embeddings(parsed, limit, offset)})


@voices_internal_api_view(["POST"])
def apply_projection(request):
    data = _validated(serializers.ApplyProjectionSerializer, request.data)
    return Response(services.apply_projection(data.get("run"), data["items"]))


@voices_internal_api_view(["POST"])
def upsert_readings(request):
    data = _validated(serializers.UpsertReadingsSerializer, request.data)
    return Response(services.upsert_readings(data["run"], data["model"], data["prompt_version"], data["items"]))


@voices_internal_api_view(["POST"])
def replace_topics(request):
    data = _validated(serializers.ReplaceTopicsSerializer, request.data)
    return Response(services.replace_topics(data.get("run"), data["week"], data["topics"]))


@voices_internal_api_view(["POST"])
def upsert_games(request):
    data = _validated(serializers.UpsertGamesSerializer, request.data)
    return Response(services.upsert_games(data["items"]))


@voices_internal_api_view(["GET"])
def export_readings(_request):
    return Response({"readings": services.export_readings()})


def _week_date(starts_on: str):
    try:
        return drf.DateField().to_internal_value(starts_on)
    except drf.ValidationError as error:
        raise NotFound from error


@voices_api_view(["GET"])
def list_weeks(_request):
    return Response({"weeks": reads.list_weeks()})


@voices_api_view(["GET"])
def week_detail(_request, starts_on):
    try:
        return Response(reads.week_detail(_week_date(starts_on)))
    except Week.DoesNotExist as error:
        raise NotFound from error


@voices_api_view(["GET"])
def week_posts(_request, starts_on):
    try:
        return Response({"posts": reads.week_posts(_week_date(starts_on))})
    except Week.DoesNotExist as error:
        raise NotFound from error


@voices_api_view(["GET"])
def week_map(_request, starts_on):
    try:
        return Response(reads.week_map(_week_date(starts_on)))
    except Week.DoesNotExist as error:
        raise NotFound from error


@voices_api_view(["GET"])
def thread(_request, voice_id):
    try:
        return Response(reads.thread(voice_id))
    except Voice.DoesNotExist as error:
        raise NotFound from error
