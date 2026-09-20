import { moodByKey, type MoodKey } from "./vocab";

export const clampYards = (yards: number) => Math.max(0, Math.min(100, yards));

/** Where tick `index` of `count` sits on the mood's gradient, as a CSS color. */
export function tickColor(from: string, to: string, index: number, count: number): string {
  const along = count <= 1 ? 0 : index / (count - 1);
  const fromShare = Math.round((1 - along) * 100);
  return `color-mix(in srgb, ${from} ${fromShare}%, ${to})`;
}

/** How many of `ticks` a reading of `yards` lights. */
export function filledTicks(yards: number, ticks: number): number {
  return Math.round((clampYards(yards) / 100) * ticks);
}

export interface MoodShare {
  mood: MoodKey;
  /** 0–1; shares are drawn in order and may sum to less than one. */
  share: number;
}

/** The mix as words, for assistive tech: "Heated 31%, Frustrated 27%". */
export function describeMix(shares: readonly MoodShare[]): string {
  return shares
    .filter((s) => s.share > 0)
    .map((s) => `${moodByKey[s.mood].label} ${Math.round(s.share * 100)}%`)
    .join(", ");
}
