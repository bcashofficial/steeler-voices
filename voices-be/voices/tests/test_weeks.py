from datetime import UTC, date, datetime

import pytest

from voices.weeks import week_end_for, week_start_for

NY = "America/New_York"


@pytest.mark.parametrize(
    "moment_utc, expected_tuesday",
    [
        (datetime(2026, 9, 15, 12, tzinfo=UTC), date(2026, 9, 15)),  # Tuesday noon opens its own week
        (datetime(2026, 9, 21, 23, 59, tzinfo=UTC), date(2026, 9, 15)),  # Monday night still belongs to it
        (datetime(2026, 9, 15, 3, 0, tzinfo=UTC), date(2026, 9, 8)),  # 03:00 UTC Tue is Mon 23:00 in Pittsburgh
        (datetime(2026, 9, 20, 17, tzinfo=UTC), date(2026, 9, 15)),  # game-day Sunday
    ],
)
def test_week_starts_on_the_tuesday_in_pittsburgh_time(moment_utc, expected_tuesday):
    assert week_start_for(moment_utc) == expected_tuesday


def test_week_ends_on_the_following_monday():
    assert week_end_for(date(2026, 9, 15)) == date(2026, 9, 21)
