from rest_framework.response import Response

from documents.models import Document, GenerationRun
from shared.decorators import voices_api_view
from voices.models import Embedding, Reading, Topic, Voice, Week


@voices_api_view(["GET"])
def status(_request):
    """How full the store is — what the scheduler and the app read first."""
    return Response(
        {
            "voices": Voice.objects.count(),
            "embeddings": Embedding.objects.count(),
            "projected": Embedding.objects.filter(x__isnull=False).count(),
            "readings": Reading.objects.values("voice_id").distinct().count(),
            "topics": Topic.objects.count(),
            "weeks": Week.objects.count(),
            "generation_runs": GenerationRun.objects.count(),
            "documents": Document.objects.count(),
        }
    )
