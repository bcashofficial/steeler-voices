/**
 * MoodMix — a set of voices' 100 yards split by mood: one segment per
 * mood, sized by its share, in the mood's gradient, on the pulse track.
 * Under a subject row and along the bottom of a post card's cover.
 */

import type { CSSProperties } from "react";

import { motion } from "./tokens";
import { describeMix, type MoodShare } from "./pulseMath";
import { moodByKey } from "./vocab";

export interface MoodMixProps {
  shares: readonly MoodShare[];
  size?: "sm" | "md";
  label?: string;
  style?: CSSProperties;
}

const HEIGHT = { sm: 6, md: 10 } as const;

export function MoodMix({ shares, size = "sm", label, style }: MoodMixProps) {
  return (
    <div
      role="img"
      aria-label={label ? `${label}: ${describeMix(shares)}` : describeMix(shares)}
      style={{
        display: "flex",
        height: HEIGHT[size],
        width: "100%",
        borderRadius: 999,
        overflow: "hidden",
        background: "var(--sv-field)",
        ...style,
      }}
    >
      {shares.map(({ mood, share }) => {
        const { from, to } = moodByKey[mood];
        return (
          <i
            key={mood}
            data-mood={mood}
            style={{
              display: "block",
              height: "100%",
              width: `${Math.max(0, Math.min(1, share)) * 100}%`,
              background: `linear-gradient(90deg, ${from}, ${to})`,
              transition: `width ${motion.roll}`,
            }}
          />
        );
      })}
    </div>
  );
}
