from datetime import date

import pytest
from django.core.management import call_command

from lookups.models import LKSources
from pipelines.tests.factories import PipelineRunFactory
from voices.models import Embedding, Game, Reading, Topic, Voice, Week
from voices.tests.factories import EmbeddingFactory, VoiceFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def seeded():
    call_command("seed_lookups")
    return LKSources.objects.get(label="r/steelers")


def post_item(**overrides):
    item = {
        "external_id": "1wj04z1",
        "voice_type": "post",
        "external_url": "https://www.reddit.com/r/steelers/comments/1wj04z1/",
        "author": "Stealth_Well_worn",
        "title": "Joey Porter Jr leaves steelers practice",
        "body_text": "",
        "posted_at": "2026-09-17T17:16:00Z",
        "score": 1900,
        "reply_count": 601,
    }
    return {**item, **overrides}


def comment_item(external_id, parent, body, **overrides):
    return {
        "external_id": external_id,
        "voice_type": "comment",
        "external_url": f"https://www.reddit.com/r/steelers/comments/1wj04z1/_/{external_id}/",
        "thread_external_id": "1wj04z1",
        "parent_external_id": parent,
        "author": "swampthingsden",
        "body_text": body,
        "posted_at": "2026-09-17T17:19:00Z",
        "score": 313,
        **overrides,
    }


def test_ingest_creates_threads_weeks_and_authors(internal_client, seeded):
    body = {
        "source": "r/steelers",
        "items": [post_item(), comment_item("c1", "1wj04z1", "Really can’t believe it got to this point.")],
    }
    response = internal_client.post("/api/internal/voices/", body, format="json")
    assert response.status_code == 200
    assert response.data["new"] == 2 and response.data["orphans"] == 0
    comment = Voice.objects.get(external_id="c1")
    assert comment.thread.external_id == "1wj04z1"
    assert comment.parent == comment.thread and comment.depth == 1
    assert comment.week.starts_on == date(2026, 9, 15)
    assert comment.author.voice_count == 1


def test_ingest_is_idempotent_and_detects_edits(internal_client, seeded):
    first = internal_client.post(
        "/api/internal/voices/", {"source": "r/steelers", "items": [post_item()]}, format="json"
    )
    again = internal_client.post(
        "/api/internal/voices/", {"source": "r/steelers", "items": [post_item()]}, format="json"
    )
    edited = internal_client.post(
        "/api/internal/voices/", {"source": "r/steelers", "items": [post_item(score=2100)]}, format="json"
    )
    assert (first.data["new"], again.data["unchanged"], edited.data["updated"]) == (1, 1, 1)
    assert Voice.objects.count() == 1


def test_a_weak_item_never_overwrites_a_known_voice(internal_client, seeded):
    internal_client.post("/api/internal/voices/", {"source": "r/steelers", "items": [post_item()]}, format="json")
    weak = post_item(score=None, body_text="rendered differently", weak=True)
    response = internal_client.post("/api/internal/voices/", {"source": "r/steelers", "items": [weak]}, format="json")
    assert response.data["unchanged"] == 1
    assert Voice.objects.get().score == 1900


def test_a_reply_whose_parent_arrives_later_is_linked_then(internal_client, seeded):
    reply_first = {"source": "r/steelers", "items": [comment_item("c2", "c1", "Yeah agreed.")]}
    orphaned = internal_client.post("/api/internal/voices/", reply_first, format="json")
    assert orphaned.data["orphans"] == 1
    parents = {"source": "r/steelers", "items": [post_item(), comment_item("c1", "1wj04z1", "Can’t believe it.")]}
    internal_client.post("/api/internal/voices/", parents, format="json")
    relink = internal_client.post("/api/internal/voices/", reply_first, format="json")
    assert relink.data["orphans"] == 0
    reply = Voice.objects.get(external_id="c2")
    assert reply.parent.external_id == "c1" and reply.depth == 2


def test_pending_lists_voices_without_an_embedding_then_without_a_reading(internal_client, seeded):
    voice = VoiceFactory(body_text="Just trade him.")
    EmbeddingFactory(voice=VoiceFactory(body_text="Beanie is a good kid"))
    needing_vectors = internal_client.get("/api/internal/voices/pending/?need=embedding").data["voices"]
    assert [v["voice_id"] for v in needing_vectors] == [str(voice.voice_id)]
    needing_readings = internal_client.get("/api/internal/voices/pending/?need=reading").data["voices"]
    assert len(needing_readings) == 2


def test_embeddings_projection_and_readings_round_trip(internal_client, seeded):
    voice = VoiceFactory(body_text="Faking another injury I see.")
    run = PipelineRunFactory()
    vector = [0.1] * 384
    embed = internal_client.post(
        "/api/internal/embeddings/",
        {
            "run": str(run.pk),
            "model": "BAAI/bge-small-en-v1.5",
            "items": [{"voice_id": str(voice.voice_id), "vector": vector, "source_text": voice.body_text}],
        },
        format="json",
    )
    assert embed.data["written"] == 1
    project = internal_client.post(
        "/api/internal/projections/", {"items": [{"voice_id": str(voice.voice_id), "x": 0.3, "y": -1.2}]}, format="json"
    )
    assert project.data["written"] == 1
    assert Embedding.objects.get(voice=voice).x == pytest.approx(0.3)
    reading = internal_client.post(
        "/api/internal/readings/",
        {
            "run": str(run.pk),
            "model": "qwen3:4b-instruct",
            "prompt_version": "v1",
            "items": [
                {
                    "voice_id": str(voice.voice_id),
                    "mood": "heated",
                    "intensity": 0.91,
                    "target": "player",
                    "sarcasm": False,
                    "gist": "Done with him.",
                    "subjects": ["Joey Porter Jr."],
                    "raw": {},
                }
            ],
        },
        format="json",
    )
    assert reading.data["written"] == 1
    assert Reading.objects.get(voice=voice).subjects == ["Joey Porter Jr."]
    exported = internal_client.get("/api/internal/readings/export/").data["readings"]
    assert exported[0]["external_id"] == voice.external_id and exported[0]["mood"] == "heated"


def test_a_bad_vector_is_rejected(internal_client, seeded):
    voice = VoiceFactory()
    response = internal_client.post(
        "/api/internal/embeddings/",
        {"model": "m", "items": [{"voice_id": str(voice.voice_id), "vector": [0.1, 0.2], "source_text": "x"}]},
        format="json",
    )
    assert response.status_code == 400


def test_topics_replace_the_weeks_set_and_assign_embeddings(internal_client, seeded):
    a, b = EmbeddingFactory(), EmbeddingFactory()
    week = a.voice.week
    body = {
        "week": str(week.starts_on),
        "topics": [
            {
                "label": "JPJ contract",
                "summary": "",
                "centroid": [0.0] * 384,
                "voice_ids": [str(a.voice_id), str(b.voice_id)],
            },
            {"label": "Patriots week", "summary": "", "centroid": [0.0] * 384, "voice_ids": []},
        ],
    }
    first = internal_client.post("/api/internal/topics/", body, format="json")
    assert first.data == {"topics": 2, "assigned": 2}
    body["topics"] = body["topics"][:1]
    internal_client.post("/api/internal/topics/", body, format="json")
    assert Topic.objects.filter(week=week).count() == 1
    assert Embedding.objects.get(pk=a.pk).topic.label == "JPJ contract"


def test_games_land_in_their_tuesday_week(internal_client, seeded):
    body = {
        "items": [
            {
                "espn_event_id": "401872946",
                "opponent": "New England Patriots",
                "opponent_abbreviation": "NE",
                "kickoff_at": "2026-09-20T17:00Z",
                "is_home": False,
                "venue": "Gillette Stadium",
                "status": "scheduled",
            }
        ]
    }
    response = internal_client.post("/api/internal/games/", body, format="json")
    assert response.data == {"new": 1}
    assert Game.objects.get().week.starts_on == date(2026, 9, 15)
    assert Week.objects.get().ends_on == date(2026, 9, 21)


def test_runs_start_and_finish(internal_client, seeded):
    started = internal_client.post(
        "/api/internal/pipelines/runs/", {"pipeline": "ingest", "host": "local"}, format="json"
    )
    assert started.status_code == 201
    run_id = started.data["pipeline_run_id"]
    finished = internal_client.patch(
        f"/api/internal/pipelines/runs/{run_id}/", {"exit_code": 0, "counts": {"new": 40}}, format="json"
    )
    assert finished.data["exit_code"] == 0 and finished.data["finished_at"] is not None
    listing = internal_client.get("/api/pipelines/").data["pipelines"]
    assert next(p for p in listing if p["key"] == "ingest")["last_run"]["counts"] == {"new": 40}


def test_generation_is_requested_per_arm(internal_client, seeded):
    week = VoiceFactory().week
    response = internal_client.post(
        "/api/internal/generate/", {"week": str(week.starts_on), "arms": ["rag", "baseline"]}, format="json"
    )
    assert response.status_code == 201
    assert sorted(r["arm"] for r in response.data["generation_runs"]) == ["baseline", "rag"]


def test_internal_endpoints_refuse_without_the_key(api_client, seeded):
    assert api_client.post("/api/internal/voices/", {}, format="json").status_code == 401
