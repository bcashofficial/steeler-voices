"""Steeler Nation's week runs Tuesday through Monday, on Pittsburgh time.

Every week boundary on the platform comes from these two functions so the
ingest pipeline, the document generator and the app agree on which week a
voice belongs to.
"""

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from django.conf import settings

TUESDAY = 1  # date.weekday(): Monday is 0
WEEK_LENGTH = timedelta(days=7)


def week_start_for(moment: datetime) -> date:
    """The Tuesday that opens the week containing `moment` (an aware datetime)."""
    local_day = moment.astimezone(ZoneInfo(settings.COMMUNITY_TIME_ZONE)).date()
    days_since_tuesday = (local_day.weekday() - TUESDAY) % 7
    return local_day - timedelta(days=days_since_tuesday)


def week_end_for(starts_on: date) -> date:
    """The Monday that closes the week opened by `starts_on`."""
    return starts_on + WEEK_LENGTH - timedelta(days=1)
