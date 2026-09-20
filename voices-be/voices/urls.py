from django.urls import path

from voices import views

urlpatterns = [
    path("api/weeks/", views.list_weeks),
    path("api/weeks/<str:starts_on>/", views.week_detail),
    path("api/weeks/<str:starts_on>/posts/", views.week_posts),
    path("api/weeks/<str:starts_on>/map/", views.week_map),
    path("api/threads/<uuid:voice_id>/", views.thread),
    path("api/internal/voices/", views.ingest_voices),
    path("api/internal/voices/pending/", views.pending_voices),
    path("api/internal/embeddings/", views.upsert_embeddings),
    path("api/internal/embeddings/list/", views.list_embeddings),
    path("api/internal/projections/", views.apply_projection),
    path("api/internal/readings/", views.upsert_readings),
    path("api/internal/readings/export/", views.export_readings),
    path("api/internal/topics/", views.replace_topics),
    path("api/internal/games/", views.upsert_games),
]
