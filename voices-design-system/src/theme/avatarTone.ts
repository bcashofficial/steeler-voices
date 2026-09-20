import { palette } from "./tokens";

export type AvatarTone = "gold" | "blue" | "olive" | "ink";

const TONES: AvatarTone[] = ["gold", "blue", "olive", "ink"];

/** A stable tone for a handle, so a fan keeps their color across the board. */
export function toneFor(handle: string): AvatarTone {
  let hash = 0;
  for (const char of handle) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

/** The letter on the square: the first character after any `u/`. */
export function initialFor(handle: string): string {
  const bare = handle.replace(/^u\//, "");
  return (bare[0] ?? "?").toUpperCase();
}

export const TONE_FILL: Record<AvatarTone, string> = {
  gold: palette.gold,
  blue: palette.blue,
  olive: palette.olive,
  ink: "var(--sv-ink-solid)",
};

export const TONE_INK: Record<AvatarTone, string> = {
  gold: palette.ink,
  blue: palette.white,
  olive: palette.white,
  ink: "var(--sv-ground)",
};
