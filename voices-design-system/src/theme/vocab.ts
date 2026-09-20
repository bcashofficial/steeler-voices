/**
 * The platform's words, mirrored from voices-be `lookups/vocab.py`. The
 * backend seeds these into LK tables; the design system paints them. When
 * a word changes it changes in both files in the same change.
 */

import { palette } from "./tokens";

export type MoodKey = "hyped" | "hopeful" | "proud" | "level" | "uneasy" | "frustrated" | "heated";

/** A mood is a word and the two stops of its gradient. Pairs share a hue
 *  and differ in where the gradient goes, so seven moods sit on five
 *  colors without hatching. Heated starts on the ink, which is the theme's
 *  ink color — resolved at paint time via `--sv-ink-solid`. */
export interface Mood {
  key: MoodKey;
  label: string;
  from: string;
  to: string;
}

export const MOODS: readonly Mood[] = [
  { key: "hyped", label: "Hyped", from: palette.gold, to: "#FFF6B0" },
  { key: "hopeful", label: "Hopeful", from: palette.gold, to: palette.olive },
  { key: "proud", label: "Proud", from: palette.blue, to: "#6FB4E8" },
  { key: "level", label: "Level", from: palette.blue, to: "#9DB9CC" },
  { key: "uneasy", label: "Uneasy", from: palette.olive, to: "#AEBF58" },
  { key: "frustrated", label: "Frustrated", from: palette.olive, to: "#3A3F1A" },
  { key: "heated", label: "Heated", from: "var(--sv-ink-solid)", to: palette.blue },
] as const;

export const moodByKey: Record<MoodKey, Mood> = Object.fromEntries(
  MOODS.map((mood) => [mood.key, mood]),
) as Record<MoodKey, Mood>;

export const GROUPINGS = [
  { key: "subject", label: "By subject" },
  { key: "topic", label: "By topic" },
  { key: "mood", label: "By mood" },
] as const;
export type GroupingKey = (typeof GROUPINGS)[number]["key"];

export const SECTIONS = [
  { key: "board", label: "Board" },
  { key: "document", label: "Document" },
  { key: "map", label: "Map" },
  { key: "ab", label: "A/B" },
  { key: "pipelines", label: "Pipelines" },
] as const;
export type SectionKey = (typeof SECTIONS)[number]["key"];

export const WORDS = {
  thread: "Thread",
  posts: "Posts",
  comments: "Comments",
  subjects: "Subjects",
  yards: "yards",
  openBoard: "Open the board",
  at: "at",
  op: "OP",
  photo: "Photo",
  link: "Link",
  sarcasm: "read as sarcasm",
  switchToDark: "Switch to dark",
  switchToLight: "Switch to light",
  openFlyer: "Open this week's flyer",
} as const;
