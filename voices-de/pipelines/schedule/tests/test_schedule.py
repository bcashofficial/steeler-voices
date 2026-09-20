from pipelines.schedule.services import shape_event

EVENT = {
    "id": "401872946",
    "date": "2026-09-20T17:00Z",
    "competitions": [
        {
            "venue": {"fullName": "Gillette Stadium"},
            "status": {"type": {"name": "STATUS_SCHEDULED"}},
            "competitors": [
                {
                    "homeAway": "home",
                    "team": {"abbreviation": "NE", "displayName": "New England Patriots"},
                    "score": {"value": None},
                },
                {
                    "homeAway": "away",
                    "team": {"abbreviation": "PIT", "displayName": "Pittsburgh Steelers"},
                    "score": {"value": None},
                },
            ],
        }
    ],
}


def test_an_away_game_is_shaped_from_the_steelers_side():
    game = shape_event(EVENT, "PIT")
    assert game["opponent_abbreviation"] == "NE" and game["is_home"] is False
    assert game["venue"] == "Gillette Stadium" and game["status"] == "scheduled"
    assert game["steelers_score"] is None


def test_a_final_carries_both_scores():
    final = {**EVENT, "competitions": [{**EVENT["competitions"][0], "status": {"type": {"name": "STATUS_FINAL"}}}]}
    final["competitions"][0]["competitors"][0]["score"] = {"value": 13.0}
    final["competitions"][0]["competitors"][1]["score"] = {"value": 20.0}
    game = shape_event(final, "PIT")
    assert (game["steelers_score"], game["opponent_score"], game["status"]) == (20, 13, "final")
