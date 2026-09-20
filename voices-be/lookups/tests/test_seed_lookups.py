import pytest
from django.core.management import call_command

from lookups.models import LKArms, LKMoods, LKPipelines, LKSources, LKTargets


@pytest.mark.django_db
def test_seed_is_idempotent():
    call_command("seed_lookups")
    call_command("seed_lookups")
    assert LKSources.objects.count() == 2
    assert LKTargets.objects.count() == 8
    assert LKPipelines.objects.count() == 9
    assert LKMoods.objects.count() == 7


@pytest.mark.django_db
def test_arms_disagree_only_on_retrieval():
    call_command("seed_lookups")
    assert LKArms.objects.get(key="rag").uses_retrieval is True
    assert LKArms.objects.get(key="baseline").uses_retrieval is False
