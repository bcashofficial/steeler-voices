from rest_framework import serializers

from lookups.models import LKMoods, LKSources, LKTargets, LKVoiceTypes
from pipelines.models import PipelineRun
from voices.models import EMBEDDING_DIMENSIONS


class RunField(serializers.PrimaryKeyRelatedField):
    def __init__(self, **kwargs):
        super().__init__(queryset=PipelineRun.objects.all(), required=False, allow_null=True, **kwargs)


class VoiceItemSerializer(serializers.Serializer):
    external_id = serializers.CharField(max_length=32)
    voice_type = serializers.SlugRelatedField(slug_field="key", queryset=LKVoiceTypes.objects.all())
    external_url = serializers.URLField(max_length=500)
    thread_external_id = serializers.CharField(max_length=32, required=False, allow_null=True, allow_blank=True)
    parent_external_id = serializers.CharField(max_length=32, required=False, allow_null=True, allow_blank=True)
    author = serializers.CharField(max_length=80)
    title = serializers.CharField(required=False, allow_blank=True, default="")
    body_text = serializers.CharField(required=False, allow_blank=True, default="")
    body_html = serializers.CharField(required=False, allow_blank=True, default="")
    flair = serializers.CharField(max_length=80, required=False, allow_blank=True, default="")
    score = serializers.IntegerField(required=False, allow_null=True, default=None)
    reply_count = serializers.IntegerField(required=False, allow_null=True, default=None)
    posted_at = serializers.DateTimeField()


class IngestVoicesSerializer(serializers.Serializer):
    source = serializers.SlugRelatedField(slug_field="label", queryset=LKSources.objects.all())
    run = RunField()
    items = VoiceItemSerializer(many=True)


class PendingQuerySerializer(serializers.Serializer):
    need = serializers.ChoiceField(choices=["embedding", "reading", "projection"])
    limit = serializers.IntegerField(min_value=1, max_value=2000, default=500)
    week = serializers.DateField(required=False)


class VectorField(serializers.ListField):
    child = serializers.FloatField()

    def to_internal_value(self, data):
        vector = super().to_internal_value(data)
        if len(vector) != EMBEDDING_DIMENSIONS:
            raise serializers.ValidationError(f"vector must have {EMBEDDING_DIMENSIONS} dimensions")
        return vector


class EmbeddingItemSerializer(serializers.Serializer):
    voice_id = serializers.UUIDField()
    vector = VectorField()
    source_text = serializers.CharField(allow_blank=True)


class UpsertEmbeddingsSerializer(serializers.Serializer):
    run = RunField()
    model = serializers.CharField(max_length=80)
    items = EmbeddingItemSerializer(many=True)


class ProjectionItemSerializer(serializers.Serializer):
    voice_id = serializers.UUIDField()
    x = serializers.FloatField()
    y = serializers.FloatField()


class ApplyProjectionSerializer(serializers.Serializer):
    run = RunField()
    items = ProjectionItemSerializer(many=True)


class ReadingItemSerializer(serializers.Serializer):
    voice_id = serializers.UUIDField()
    mood = serializers.SlugRelatedField(slug_field="key", queryset=LKMoods.objects.all())
    intensity = serializers.FloatField(min_value=0, max_value=1)
    target = serializers.SlugRelatedField(slug_field="key", queryset=LKTargets.objects.all())
    sarcasm = serializers.BooleanField(default=False)
    gist = serializers.CharField(allow_blank=True, default="")
    subjects = serializers.ListField(child=serializers.CharField(max_length=80), default=list)
    raw = serializers.DictField(default=dict)


class UpsertReadingsSerializer(serializers.Serializer):
    run = serializers.PrimaryKeyRelatedField(queryset=PipelineRun.objects.all())
    model = serializers.CharField(max_length=80)
    prompt_version = serializers.CharField(max_length=32)
    items = ReadingItemSerializer(many=True)


class TopicItemSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=120)
    summary = serializers.CharField(allow_blank=True, default="")
    centroid = VectorField()
    voice_ids = serializers.ListField(child=serializers.UUIDField())


class ReplaceTopicsSerializer(serializers.Serializer):
    run = RunField()
    week = serializers.DateField()
    topics = TopicItemSerializer(many=True)


class GameItemSerializer(serializers.Serializer):
    espn_event_id = serializers.CharField(max_length=32)
    opponent = serializers.CharField(max_length=80)
    opponent_abbreviation = serializers.CharField(max_length=8)
    kickoff_at = serializers.DateTimeField()
    is_home = serializers.BooleanField()
    venue = serializers.CharField(max_length=120, allow_blank=True, default="")
    status = serializers.CharField(max_length=32, default="scheduled")
    steelers_score = serializers.IntegerField(required=False, allow_null=True, default=None)
    opponent_score = serializers.IntegerField(required=False, allow_null=True, default=None)


class UpsertGamesSerializer(serializers.Serializer):
    items = GameItemSerializer(many=True)
