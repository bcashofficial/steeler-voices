from rest_framework import serializers

from lookups.models import LKArms
from pipelines.models import PipelineRun


class RequestGenerationSerializer(serializers.Serializer):
    week = serializers.DateField()
    arms = serializers.SlugRelatedField(slug_field="key", queryset=LKArms.objects.all(), many=True)
    run = serializers.PrimaryKeyRelatedField(queryset=PipelineRun.objects.all(), required=False, allow_null=True)
