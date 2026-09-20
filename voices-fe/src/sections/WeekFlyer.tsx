/**
 * The week's flyer, filled from the week's detail: the matchup from its
 * game (away at home, the community's team on its side), the three counts,
 * and the top subjects.
 */

import { Flyer } from "design_system/theme";

import type { WeekDetail } from "../api/types";
import { matchupFor } from "./matchup";

interface WeekFlyerProps {
  detail: WeekDetail;
  team: string;
  open: boolean;
  onClose: () => void;
}

export function WeekFlyer({ detail, team, open, onClose }: WeekFlyerProps) {
  return (
    <Flyer
      open={open}
      onClose={onClose}
      week={detail.week.label}
      game={matchupFor(detail, team)}
      counts={detail.counts}
      subjects={detail.subjects.slice(0, 4)}
    />
  );
}
