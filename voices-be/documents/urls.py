from django.urls import path

from documents import views

urlpatterns = [
    path("api/weeks/<str:starts_on>/documents/", views.week_documents),
    path("api/internal/generate/", views.request_generation),
]
