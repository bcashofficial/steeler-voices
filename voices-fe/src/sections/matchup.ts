/** The week's matchup from its game, read "away at home", the community's team on its side. */

import type { WeekDetail } from "../api/types";

export function matchupFor(detail: WeekDetail, team: string) {
  const game = detail.week.games[0];
  if (!game) return null;
  return game.is_home ? { away: game.opponent, home: team } : { away: team, home: game.opponent };
}
