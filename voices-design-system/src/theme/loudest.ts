import type { MoodShare } from "./pulseMath";
import { MOODS, type MoodKey } from "./vocab";

/** The mood with the largest share of a mix — a thread's loudest mood. */
export function loudestMood(shares: readonly MoodShare[]): MoodKey {
  let loudest: MoodShare | null = null;
  for (const share of shares) {
    if (!loudest || share.share > loudest.share) loudest = share;
  }
  return loudest?.mood ?? MOODS[0].key;
}
