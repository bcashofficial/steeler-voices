/**
 * MoodSwatch — one mood as a small color chip: a card in the mood's
 * gradient, the product name top-left, the mood word bottom-left, text in
 * ink or mist by the chip's luminance. Seven in a row make a legend. `on`
 * lifts the chip and gives it an ink ring.
 */

import type { CSSProperties } from "react";

import { inkFor } from "./contrast";
import { moodStops, motion, typography } from "./tokens";
import { useVoicesTheme } from "./VoicesThemeContext";
import { moodByKey, WORDS, type MoodKey } from "./vocab";

export interface MoodSwatchProps {
  mood: MoodKey;
  on?: boolean;
  style?: CSSProperties;
}

export function MoodSwatch({ mood, on = false, style }: MoodSwatchProps) {
  const { mode } = useVoicesTheme();
  const { from, to } = moodStops[mode][mood];
  const ink = inkFor(from);
  return (
    <span
      data-on={on}
      data-mood={mood}
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        width: 96,
        height: 52,
        padding: "5px 7px",
        borderRadius: 4,
        background: `linear-gradient(90deg, ${from}, ${to})`,
        color: ink,
        boxShadow: on
          ? "0 0 0 1.5px var(--sv-ink), 0 6px 14px rgba(0,0,0,0.25)"
          : "0 1px 2px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.12)",
        transform: on ? "translateY(-2px)" : "none",
        transition: `transform ${motion.lift}, box-shadow ${motion.lift}`,
        fontFamily: typography.body,
        ...style,
      }}
    >
      <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1 }}>
        {WORDS.productName}
      </span>
      <span />
      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1 }}>
        {moodByKey[mood].label}
      </span>
    </span>
  );
}
