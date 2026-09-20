/**
 * The readings pane's arithmetic: a thread's voices grouped by subject,
 * topic or mood into rows with a count and a mood mix; the voices a pressed
 * row keeps; the reading the scoreboard rests on.
 */

import { moodByKey, type GroupingKey, type MoodKey, type Reading } from "design_system/theme";

import type { MoodShare, ThreadVoice } from "../api/types";

export interface GroupRow {
  key: string;
  label: string;
  count: number;
  shares: MoodShare[];
}

/** A set of voices' 100 yards split by mood, loudest first. */
export function moodShares(voices: readonly ThreadVoice[]): MoodShare[] {
  const counts = new Map<MoodKey, number>();
  for (const voice of voices) {
    if (voice.reading) counts.set(voice.reading.mood, (counts.get(voice.reading.mood) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([mood, n]) => ({ mood, share: n / total }));
}

/** The keys a voice files under for a grouping: its subjects, its topic, its mood. */
export function keysFor(voice: ThreadVoice, grouping: GroupingKey): string[] {
  if (grouping === "subject") return voice.reading?.subjects ?? [];
  if (grouping === "topic") return voice.topic ? [voice.topic] : [];
  return voice.reading ? [voice.reading.mood] : [];
}

function labelFor(key: string, grouping: GroupingKey): string {
  return grouping === "mood" ? moodByKey[key as MoodKey].label : key;
}

/** The rows of the readings pane, most voices first. */
export function groupVoices(voices: readonly ThreadVoice[], grouping: GroupingKey): GroupRow[] {
  const members = new Map<string, ThreadVoice[]>();
  for (const voice of voices) {
    for (const key of keysFor(voice, grouping)) {
      members.set(key, [...(members.get(key) ?? []), voice]);
    }
  }
  return [...members.entries()]
    .map(([key, kept]) => ({
      key,
      label: labelFor(key, grouping),
      count: kept.length,
      shares: moodShares(kept),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** The voices a pressed row keeps in the thread; every voice when none is pressed. */
export function keepVoices(
  voices: readonly ThreadVoice[],
  grouping: GroupingKey,
  pressed: string | null,
): ThreadVoice[] {
  if (pressed === null) return [...voices];
  return voices.filter((voice) => keysFor(voice, grouping).includes(pressed));
}

/** A thread voice's reading as the scoreboard plays it. */
export function readingFor(voice: ThreadVoice, who: string): Reading | null {
  if (!voice.reading) return null;
  return {
    mood: voice.reading.mood,
    yards: voice.reading.yards,
    who,
    sarcasm: voice.reading.sarcasm,
  };
}
