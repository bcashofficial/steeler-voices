import type { WeekDetail } from "../api/types";
import { matchupFor } from "./matchup";

const detail = (games: WeekDetail["week"]["games"]): WeekDetail => ({
  week: {
    starts_on: "2026-09-15",
    ends_on: "2026-09-21",
    label: "week of Sep 15",
    posts: 79,
    comments: 3734,
    games,
  },
  counts: {
    posts: 79,
    comments: 3734,
    subjects: 7,
    projected: 0,
    documents: 0,
    generation_runs: 0,
  },
  subjects: [],
});
const game = {
  opponent: "New England Patriots",
  opponent_abbreviation: "NE",
  kickoff_at: "2026-09-20T17:00:00Z",
  status: "scheduled",
  steelers_score: null,
  opponent_score: null,
};

test("reads the matchup as away at home, the team on its side", () => {
  expect(matchupFor(detail([{ ...game, is_home: false }]), "Steelers")).toEqual({
    away: "Steelers",
    home: "New England Patriots",
  });
  expect(matchupFor(detail([{ ...game, is_home: true }]), "Steelers")).toEqual({
    away: "New England Patriots",
    home: "Steelers",
  });
  expect(matchupFor(detail([]), "Steelers")).toBeNull();
});
