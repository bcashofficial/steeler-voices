from django.urls import path

from lookups import views

urlpatterns = [path("api/vocab/", views.vocab)]
