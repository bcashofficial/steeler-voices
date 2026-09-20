import pytest
from django.db import IntegrityError

from documents.tests.factories import DocumentFactory, GenerationRunFactory


@pytest.mark.django_db
def test_only_one_published_document_per_week_and_arm():
    run = GenerationRunFactory()
    DocumentFactory(generation_run=run, is_published=True)
    with pytest.raises(IntegrityError):
        DocumentFactory(generation_run=GenerationRunFactory(week=run.week, arm=run.arm), is_published=True)


@pytest.mark.django_db
def test_drafts_may_coexist():
    run = GenerationRunFactory()
    DocumentFactory(generation_run=run, is_published=False)
    DocumentFactory(generation_run=GenerationRunFactory(week=run.week, arm=run.arm), is_published=False)
