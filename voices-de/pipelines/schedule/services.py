"""Schedule: the season's games and results from ESPN's public site API,
shaped into the games contract. The backend places each game in its
Tuesday week."""

import requests

from pipelines.shared.services.runner import Context

ESPN = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{team}/schedule"
STATUS = {"STATUS_SCHEDULED": "scheduled", "STATUS_IN_PROGRESS": "in_progress", "STATUS_FINAL": "final"}


def shape_event(event: dict, team_abbreviation: str) -> dict:
    competition = event["competitions"][0]
    sides = {side["homeAway"]: side for side in competition["competitors"]}
    ours = sides["home"] if sides["home"]["team"]["abbreviation"] == team_abbreviation else sides["away"]
    theirs = sides["away"] if ours is sides["home"] else sides["home"]
    return {
        "espn_event_id": event["id"],
        "opponent": theirs["team"]["displayName"],
        "opponent_abbreviation": theirs["team"]["abbreviation"],
        "kickoff_at": event["date"],
        "is_home": ours is sides["home"],
        "venue": competition.get("venue", {}).get("fullName", ""),
        "status": STATUS.get(competition["status"]["type"]["name"], "scheduled"),
        "steelers_score": _score(ours),
        "opponent_score": _score(theirs),
    }


def _score(side: dict) -> int | None:
    score = side.get("score")
    if isinstance(score, dict):
        score = score.get("value")
    return int(score) if score is not None else None


def fetch_schedule(team: str, session: requests.Session) -> dict:
    response = session.get(ESPN.format(team=team), timeout=30)
    response.raise_for_status()
    return response.json()


def schedule(context: Context) -> dict:
    payload = fetch_schedule(context.config.espn_team, requests.Session())
    games = [shape_event(event, context.config.espn_team.upper()) for event in payload.get("events", [])]
    counts = {"fetched": len(games), "new": 0, "updated": 0}
    if games and not context.dry_run:
        counts.update(context.backend.upsert_games(games))
    return counts
