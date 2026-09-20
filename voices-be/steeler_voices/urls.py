from django.http import JsonResponse
from django.urls import include, path

from shared.views import status


def health(_request):
    return JsonResponse({"service": "voices-be", "status": "ok"})


urlpatterns = [
    path("health/", health),
    path("api/status/", status),
    path("", include("lookups.urls")),
    path("", include("pipelines.urls")),
    path("", include("voices.urls")),
    path("", include("documents.urls")),
]
