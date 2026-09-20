from django.http import JsonResponse
from django.urls import path


def health(_request):
    return JsonResponse({"service": "voices-be", "status": "ok"})


urlpatterns = [
    path("health/", health),
]
