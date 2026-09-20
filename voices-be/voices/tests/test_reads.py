"""The app's reads: the weeks, the rail, a thread, the map."""

from datetime import UTC, datetime

import pytest

from lookups.tests.factories import MoodFactory, VoiceTypeFactory
from voices.reads import mood_shares, yards_for
from voices.tests.factories import EmbeddingFactory, ReadingFactory, TopicFactory, VoiceFactory, WeekFactory

pytestmark = pytest.mark.django_db


def post(**kwargs):
    return VoiceFactory(voice_type=VoiceTypeFactory(key="post"), **kwargs)


def comment(thread, **kwargs):
    return VoiceFactory(voice_type=VoiceTypeFactory(key="comment"), thread=thread, **kwargs)


def read(voice, mood_key, intensity=0.5, subjects=()):
    return ReadingFactory(
        voice=voice, mood=MoodFactory(key=mood_key, label=mood_key), intensity=intensity, subjects=list(subjects)
    )


def test_yards_are_intensity_on_the_field():
    assert yards_for(0.66) == 66
    assert yards_for(1.4) == 100
    assert yards_for(-1) == 0


def test_mood_shares_are_loudest_first():
    a, b, c = (read(VoiceFactory(), m) for m in ("uneasy", "heated", "uneasy"))
    assert mood_shares([a, b, c]) == [{"mood": "uneasy", "share": 2 / 3}, {"mood": "heated", "share": 1 / 3}]


def test_weeks_list_only_weeks_with_voices_newest_first(api_client):
    WeekFactory(starts_on=datetime(2026, 9, 8).date(), ends_on=datetime(2026, 9, 14).date())
    post(week=WeekFactory(starts_on=datetime(2026, 9, 15).date()))
    post(week=WeekFactory(starts_on=datetime(2026, 9, 1).date(), ends_on=datetime(2026, 9, 7).date()))
    weeks = api_client.get("/api/weeks/").json()["weeks"]
    assert [w["starts_on"] for w in weeks] == ["2026-09-15", "2026-09-01"]
    assert weeks[0]["posts"] == 1 and weeks[0]["comments"] == 0


def test_rail_carries_the_community_count_and_the_thread_mood_mix(api_client):
    root = post(title="Joey Porter Jr leaves steelers practice", reply_count=601)
    replies = [comment(root) for _ in range(3)]
    read(root, "uneasy")
    read(replies[0], "heated")
    read(replies[1], "heated")
    rows = api_client.get("/api/weeks/2026-09-15/posts/").json()["posts"]
    assert rows[0]["title"] == root.title
    assert rows[0]["comments"] == 601 and rows[0]["captured"] == 3
    assert rows[0]["shares"][0] == {"mood": "heated", "share": 2 / 3}


def test_week_detail_counts_and_top_subjects(api_client):
    root = post()
    read(root, "level", subjects=["Joey Porter Jr.", "Omar Khan"])
    read(comment(root), "level", subjects=["Joey Porter Jr."])
    detail = api_client.get("/api/weeks/2026-09-15/").json()
    assert detail["counts"]["posts"] == 1 and detail["counts"]["comments"] == 1
    assert detail["subjects"][0] == {"label": "Joey Porter Jr.", "count": 2}
    assert api_client.get("/api/weeks/2026-01-06/").status_code == 404
    assert api_client.get("/api/weeks/not-a-date/").status_code == 404


def test_thread_reads_in_order_with_newest_readings(api_client):
    root = post(title="Joey Porter Jr leaves steelers practice")
    first = comment(root, score=10, posted_at=datetime(2026, 9, 16, 13, tzinfo=UTC))
    reply = comment(root, parent=first, depth=1, score=3, posted_at=datetime(2026, 9, 16, 14, tzinfo=UTC))
    second = comment(root, score=5, posted_at=datetime(2026, 9, 16, 12, tzinfo=UTC), author=root.author)
    read(root, "uneasy", 0.66)
    read(first, "heated", 0.9)
    read(first, "level", 0.4)  # newer — the one the app shows
    EmbeddingFactory(voice=second, topic=TopicFactory(label="the secondary"))
    data = api_client.get(f"/api/threads/{root.voice_id}/").json()
    assert data["post"]["reading"] == {
        "mood": "uneasy",
        "yards": 66,
        "sarcasm": False,
        "subjects": [],
        "gist": "",
    }
    assert [v["voice_id"] for v in data["voices"]] == [str(first.voice_id), str(reply.voice_id), str(second.voice_id)]
    assert data["voices"][0]["reading"]["mood"] == "level"
    assert data["voices"][1]["depth"] == 1 and data["voices"][1]["reading"] is None
    assert data["voices"][2]["op"] is True and data["voices"][2]["topic"] == "the secondary"
    assert api_client.get(f"/api/threads/{first.voice_id}/").status_code == 404


def test_map_lists_projected_points_topics_and_the_most_retrieved(api_client):
    week = WeekFactory()
    topic = TopicFactory(week=week, label="the secondary", size=2, rank=1)
    placed = EmbeddingFactory(voice=post(week=week, title="Watt my beloved"), x=0.1, y=0.2, topic=topic)
    EmbeddingFactory(voice=post(week=week), retrieval_count=4)  # not projected: on the list, not the map
    read(placed.voice, "proud")
    data = api_client.get("/api/weeks/2026-09-15/map/").json()
    assert len(data["points"]) == 1
    assert data["points"][0]["mood"] == "proud" and data["points"][0]["topic"] == "the secondary"
    assert data["topics"][0]["label"] == "the secondary"
    assert data["most_retrieved"][0]["retrievals"] == 4
