from django.urls import path

from documents import views

urlpatterns = [
    path("api/internal/generate/", views.request_generation),
]
