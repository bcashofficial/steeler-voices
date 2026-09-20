from pipelines.tag.services import prompt_for, schema, validate

BATCH = [{"voice_id": "v1", "text": "Just trade him."}, {"voice_id": "v2", "text": "Dynasty being born."}]
MOODS = {"hyped", "heated"}
TARGETS = {"player", "none"}


def test_validate_keeps_only_real_readings_and_clamps():
    answer = {
        "readings": [
            {
                "id": "0",
                "mood": "heated",
                "intensity": 1.4,
                "target": "player",
                "sarcasm": False,
                "gist": "Done.",
                "subjects": ["Joey Porter Jr."],
            },
            {
                "id": "[1]",
                "mood": "hyped",
                "intensity": 0.9,
                "target": "none",
                "sarcasm": False,
                "gist": "",
                "subjects": [],
            },
            {
                "id": "7",
                "mood": "hyped",
                "intensity": 0.5,
                "target": "none",
                "sarcasm": False,
                "gist": "",
                "subjects": [],
            },
            {
                "id": "0",
                "mood": "not-a-mood",
                "intensity": 0.5,
                "target": "none",
                "sarcasm": False,
                "gist": "",
                "subjects": [],
            },
        ]
    }
    items = validate(answer, BATCH, MOODS, TARGETS)
    assert [i["voice_id"] for i in items] == ["v1", "v2"]
    assert items[0]["intensity"] == 1.0 and items[0]["raw"]["gist"] == "Done."


def test_schema_closes_the_vocabulary_and_prompt_numbers_the_voices():
    s = schema(["hyped"], ["player"])
    assert s["properties"]["readings"]["items"]["properties"]["mood"]["enum"] == ["hyped"]
    assert prompt_for(BATCH).startswith("Voices:\n\n[0] Just trade him.")
