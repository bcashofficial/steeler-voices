/**
 * StencilNumber — a count set in the stencil digits: one SVG per glyph,
 * uniform stroke, the gold offset painted as a second layer beneath.
 * Height sets the size; width follows the glyphs, so digits are tabular.
 */

import type { CSSProperties } from "react";

import { DIGIT_GAP, DIGIT_HEIGHT, DIGIT_STROKE, glyphFor } from "./digits";
import { formatCount } from "./format";
import { palette } from "./tokens";

export interface StencilNumberProps {
  value: number;
  /** Glyph height in px. */
  height?: number;
  /** The offset layer beneath, in gold; 0 turns it off. */
  offset?: number;
  color?: string;
  style?: CSSProperties;
}

function Glyphs({ text, height, color }: { text: string; height: number; color: string }) {
  return (
    <>
      {Array.from(text).map((char, index) => {
        const glyph = glyphFor(char);
        if (!glyph) return null;
        return (
          <svg
            key={`${char}-${index}`}
            viewBox={`0 0 ${glyph.width} ${DIGIT_HEIGHT}`}
            height={height}
            width={(glyph.width / DIGIT_HEIGHT) * height}
            aria-hidden="true"
            style={{ display: "block", overflow: "visible" }}
          >
            {glyph.strokes.map((stroke, i) => (
              <path
                key={i}
                d={stroke.d}
                fill="none"
                stroke={color}
                strokeWidth={DIGIT_STROKE}
                strokeLinecap="butt"
                strokeDasharray={stroke.dash}
              />
            ))}
          </svg>
        );
      })}
    </>
  );
}

export function StencilNumber({
  value,
  height = 40,
  offset = 3,
  color = "var(--sv-ink)",
  style,
}: StencilNumberProps) {
  const text = formatCount(value);
  const gap = (DIGIT_GAP / DIGIT_HEIGHT) * height;
  const row: CSSProperties = { display: "inline-flex", alignItems: "flex-end", gap };
  return (
    <span
      role="img"
      aria-label={text}
      style={{ position: "relative", display: "inline-block", lineHeight: 0, ...style }}
    >
      {offset > 0 ? (
        <span
          aria-hidden="true"
          style={{ ...row, position: "absolute", left: offset, top: offset }}
        >
          <Glyphs text={text} height={height} color={palette.gold} />
        </span>
      ) : null}
      <span style={{ ...row, position: "relative" }}>
        <Glyphs text={text} height={height} color={color} />
      </span>
    </span>
  );
}
