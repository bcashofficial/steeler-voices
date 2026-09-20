"""The week's brief: the few facts every arm gets — the dates, the team and
its game — and the facts only the retrieval arm gets, which name what the
community actually said: the loudest threads and the most-read subjects.
The queries the retrieval arm asks come from those.
"""

import re
from dataclasses import dataclass, field
from datetime import date

from lookups.models import LKSources
from voices.models import Voice, Week
from voices.reads import week_subjects

TOP_TITLES = 12
TOP_SUBJECTS = 10
QUERY_LIMIT = 10
STOP_WORDS = {"the", "and", "for", "with", "this", "that", "from", "about", "after", "into", "over"}


@dataclass
class Brief:
    week_start: str
    week_end: str
    team: str
    game: dict | None
    posts: int
    comments: int
    titles: list[str] = field(default_factory=list)
    subjects: list[str] = field(default_factory=list)

    def entities(self) -> set[str]:
        """The proper names of the week: subjects and the capitalized words
        of its titles. A claim that names one is specific to this week."""
        names = {subject.lower() for subject in self.subjects}
        for title in self.titles:
            for word in re.findall(r"\b[A-Z][A-Za-z'.]{2,}\b", title):
                if word.lower() not in STOP_WORDS:
                    names.add(word.lower())
        return names

    def queries(self) -> list[str]:
        """What to ask the store: each top subject, then each loud title."""
        asked = [*self.subjects, *self.titles]
        seen: list[str] = []
        for query in asked:
            if query and query not in seen:
                seen.append(query)
        return seen[:QUERY_LIMIT]


def team_name() -> str:
    source = LKSources.objects.filter(is_active=True).order_by("sort_order").first()
    return source.community.capitalize() if source else ""


def game_of(week: Week) -> dict | None:
    game = week.games.first()
    if game is None:
        return None
    return {
        "opponent": game.opponent,
        "is_home": game.is_home,
        "kickoff_at": game.kickoff_at.isoformat(),
        "status": game.status,
        "steelers_score": game.steelers_score,
        "opponent_score": game.opponent_score,
    }


def loud_titles(week: Week, limit: int = TOP_TITLES) -> list[str]:
    posts = Voice.objects.filter(week=week, is_active=True, voice_type__key="post").exclude(title="")
    return [title for title in posts.order_by("-reply_count", "-score").values_list("title", flat=True)[:limit]]


def build_brief(week_start: date) -> Brief:
    week = Week.objects.get(starts_on=week_start)
    voices = Voice.objects.filter(week=week, is_active=True)
    return Brief(
        week_start=week.starts_on.isoformat(),
        week_end=week.ends_on.isoformat(),
        team=team_name(),
        game=game_of(week),
        posts=voices.filter(voice_type__key="post").count(),
        comments=voices.filter(voice_type__key="comment").count(),
        titles=loud_titles(week),
        subjects=[row["label"] for row in week_subjects(week, TOP_SUBJECTS)],
    )
