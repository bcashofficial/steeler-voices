from django.urls import path

from pipelines import views

urlpatterns = [
    path("api/pipelines/", views.list_pipelines),
    path("api/internal/pipelines/runs/", views.start_run),
    path("api/internal/pipelines/runs/<uuid:pipeline_run_id>/", views.finish_run),
]
