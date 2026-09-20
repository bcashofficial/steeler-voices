/**
 * Numeral — a count in Anton with the gold offset, standing in for a
 * sentence. Three sizes, tabular digits, thousands separated, an optional
 * caption in micro caps beneath, and a roll to its value when asked.
 */

import type { CSSProperties } from "react";

import { formatCount } from "./format";
import { palette, typography } from "./tokens";
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

const SCALE: Record<NumeralSize, { fontSize: number; lineHeight: number; offset: string }> = {
  sm: { ...typography.scale.numeralSm, offset: typography.displayOffsetSmall },
  md: { ...typography.scale.numeralMd, offset: typography.displayOffsetSmall },
  lg: { ...typography.scale.numeral, offset: typography.displayOffset },
};

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
  const { fontSize, lineHeight, offset } = SCALE[size];
  return (
    <div className={className} style={{ display: "grid", gap: 4, textAlign: align, ...style }}>
      <span
        style={{
          fontFamily: typography.display,
          fontWeight: 400,
          fontSize,
          lineHeight,
          color: "var(--sv-ink)",
          textShadow: `${offset} ${palette.gold}`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatCount(shown)}
      </span>
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
