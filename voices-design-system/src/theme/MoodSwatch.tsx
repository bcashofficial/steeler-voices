/**
 * MoodSwatch — one mood as a legend entry: a short gradient pill and the
 * word. `on` sets the word to full ink and gives it the gold underline;
 * with `onClick` it is a text control that opens the chips.
 */

import type { CSSProperties } from "react";

import { typography } from "./tokens";
import { moodByKey, type MoodKey } from "./vocab";

export interface MoodSwatchProps {
  mood: MoodKey;
  on?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function MoodSwatch({ mood, on = false, onClick, style }: MoodSwatchProps) {
  const { from, to, label } = moodByKey[mood];
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      data-on={on}
      style={{
        background: "none",
        border: 0,
        padding: 0,
        cursor: onClick ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        paddingBottom: 2,
        borderBottom: `3px solid ${on ? "var(--sv-gold)" : "transparent"}`,
        fontFamily: typography.body,
        fontSize: 11.5,
        fontWeight: on ? 600 : 500,
        color: on ? "var(--sv-ink)" : "var(--sv-ink-2)",
        transition: "border-color 160ms ease, color 160ms ease",
        ...style,
      }}
    >
      <i
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: 26,
          height: 8,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${from}, ${to})`,
        }}
      />
      {label}
    </Tag>
  );
}
