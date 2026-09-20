from rest_framework import serializers

from lookups.models import LKPipelines
from pipelines.models import HOST_CHOICES


class StartRunSerializer(serializers.Serializer):
    pipeline = serializers.SlugRelatedField(slug_field="key", queryset=LKPipelines.objects.all())
    host = serializers.ChoiceField(choices=HOST_CHOICES, default="local")
    dry_run = serializers.BooleanField(default=False)


class FinishRunSerializer(serializers.Serializer):
    exit_code = serializers.IntegerField(min_value=0, max_value=255)
    counts = serializers.DictField(child=serializers.IntegerField(), required=False, default=dict)
    log_excerpt = serializers.CharField(required=False, allow_blank=True, default="")
