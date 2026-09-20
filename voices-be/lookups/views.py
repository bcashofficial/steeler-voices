from rest_framework.response import Response

from lookups.models import LKMoods, LKSectionKinds, LKSources, LKTargets
from shared.decorators import voices_api_view


def _rows(queryset, *fields):
    return [{field: getattr(row, field) for field in fields} for row in queryset.filter(is_active=True)]


@voices_api_view(["GET"])
def vocab(_request):
    """The platform's words, from the tables that own them."""
    return Response(
        {
            "moods": _rows(LKMoods.objects.all(), "key", "label", "color_token"),
            "targets": _rows(LKTargets.objects.all(), "key", "label"),
            "section_kinds": _rows(LKSectionKinds.objects.all(), "key", "label"),
            "sources": _rows(LKSources.objects.all(), "label", "platform", "community", "url"),
        }
    )
