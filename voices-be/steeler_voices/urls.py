from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({"service": "voices-be", "status": "ok"})


urlpatterns = [
    path("health/", health),
    path("", include("pipelines.urls")),
    path("", include("voices.urls")),
    path("", include("documents.urls")),
]
