/**
 * The platform's words, mirrored from voices-be `lookups/vocab.py`. The
 * backend seeds these into LK tables; the design system paints them. When
 * a word changes it changes in both files in the same change.
 */

export type MoodKey = "hyped" | "hopeful" | "proud" | "level" | "uneasy" | "frustrated" | "heated";

/** A mood is a word and the two stops of its gradient. The stops are the
 *  theme's `--sv-mood-*` variables (hex per theme in `tokens.moodStops`),
 *  so one primitive paints correctly on either ground. */
export interface Mood {
  key: MoodKey;
  label: string;
  from: string;
  to: string;
}

const stops = (key: MoodKey) => ({
  from: `var(--sv-mood-${key}-from)`,
  to: `var(--sv-mood-${key}-to)`,
});

export const MOODS: readonly Mood[] = [
  { key: "hyped", label: "Hyped", ...stops("hyped") },
  { key: "hopeful", label: "Hopeful", ...stops("hopeful") },
  { key: "proud", label: "Proud", ...stops("proud") },
  { key: "level", label: "Level", ...stops("level") },
  { key: "uneasy", label: "Uneasy", ...stops("uneasy") },
  { key: "frustrated", label: "Frustrated", ...stops("frustrated") },
  { key: "heated", label: "Heated", ...stops("heated") },
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
  yd: "yd",
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
