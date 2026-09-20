/** A word in the display face with the gold offset — a screen's heading. */

import type { PropsWithChildren } from "react";

import { typography } from "design_system/theme";

export function Display({ size = 26, children }: PropsWithChildren<{ size?: number }>) {
  const offset = size >= 40 ? typography.displayOffset : typography.displayOffsetSmall;
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: typography.display,
        fontWeight: 400,
        letterSpacing: "0.01em",
        fontSize: size,
        lineHeight: 1,
        color: "var(--sv-ink)",
        textShadow: `${offset} var(--sv-gold)`,
      }}
    >
      {children}
    </h2>
  );
}
