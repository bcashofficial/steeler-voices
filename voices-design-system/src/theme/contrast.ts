import { palette } from "./tokens";

/** Ink on a light color, mist on a dark one — decided from relative luminance. */
export function inkFor(hex: string): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return palette.ink;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? palette.ink : palette.mist;
}
