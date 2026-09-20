/**
 * StatusDot — a mood as an 8px dot in the mood's color with an ink ring.
 * On a post card it is the thread's loudest mood, sat on the title's
 * baseline; its accessible name is the mood word unless a label is given.
 */

import type { CSSProperties } from "react";

import { moodByKey, type MoodKey } from "./vocab";

export interface StatusDotProps {
  mood: MoodKey;
  /** The accessible name; defaults to the mood word. */
  label?: string;
  size?: number;
  style?: CSSProperties;
}

export function StatusDot({ mood, label, size = 8, style }: StatusDotProps) {
  return (
    <i
      role="img"
      aria-label={label ?? moodByKey[mood].label}
      data-mood={mood}
      style={{
        display: "inline-block",
        flex: "none",
        width: size,
        height: size,
        borderRadius: "50%",
        background: moodByKey[mood].from,
        boxShadow: "0 0 0 1px var(--sv-ink)",
        ...style,
      }}
    />
  );
}
