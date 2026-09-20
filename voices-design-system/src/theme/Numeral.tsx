/**
 * Numeral — a count standing in for a sentence: the stencil digits with the
 * gold offset, three sizes, an optional caption in micro caps beneath, and
 * a roll to its value when asked.
 */

import type { CSSProperties } from "react";

import { StencilNumber } from "./StencilNumber";
import { typography } from "./tokens";
import { useRollingNumber } from "./useRollingNumber";

export type NumeralSize = "sm" | "md" | "lg";

export interface NumeralProps {
  value: number;
  size?: NumeralSize;
  caption?: string;
  /** Roll from the previous value (or from zero on a replay) instead of snapping. */
  roll?: boolean;
  replayKey?: number;
  align?: "left" | "center" | "right";
  className?: string;
  style?: CSSProperties;
}

const HEIGHT: Record<NumeralSize, number> = { sm: 26, md: 36, lg: 50 };
const OFFSET: Record<NumeralSize, number> = { sm: 2, md: 3, lg: 4 };

export function Numeral({
  value,
  size = "md",
  caption,
  roll = false,
  replayKey = 0,
  align = "left",
  className,
  style,
}: NumeralProps) {
  const rolled = useRollingNumber(Math.round(value), 420, replayKey);
  const shown = roll ? rolled : Math.round(value);
  const justify = align === "center" ? "center" : align === "right" ? "end" : "start";
  return (
    <div className={className} style={{ display: "grid", gap: 6, justifyItems: justify, ...style }}>
      <StencilNumber value={shown} height={HEIGHT[size]} offset={OFFSET[size]} />
      {caption ? (
        <span
          style={{
            fontFamily: typography.body,
            fontSize: typography.scale.micro.fontSize,
            fontWeight: typography.scale.micro.fontWeight,
            letterSpacing: typography.scale.micro.letterSpacing,
            textTransform: "uppercase",
            color: "var(--sv-ink-3)",
          }}
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
}
