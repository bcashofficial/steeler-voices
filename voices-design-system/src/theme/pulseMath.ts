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
