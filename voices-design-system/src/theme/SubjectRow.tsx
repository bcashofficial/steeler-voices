/**
 * SubjectRow — a subject, its count, and its mood mix. Pressed rows carry
 * a 3px gold bar on the left; a press keeps only that subject's voices in
 * the thread.
 */

import { useEffect, type CSSProperties } from "react";

import { MoodMix } from "./MoodMix";
import type { MoodShare } from "./pulseMath";
import { StencilNumber } from "./StencilNumber";
import { mountStyle } from "./styles";
import { typography } from "./tokens";

export interface SubjectRowProps {
  label: string;
  count: number;
  shares: readonly MoodShare[];
  pressed?: boolean;
  onPress?: () => void;
  style?: CSSProperties;
}

const STYLE_ID = "sv-subject";
const CSS = `
.sv-subject{display:grid;grid-template-columns:1fr auto;gap:6px 10px;align-items:center;padding:9px 8px;border-radius:8px;cursor:pointer;border:0;background:none;text-align:left;color:var(--sv-ink);font-family:${typography.body};width:100%}
.sv-subject:hover{background:var(--sv-hover)}
.sv-subject[aria-pressed="true"]{background:var(--sv-hover);box-shadow:inset 3px 0 0 var(--sv-gold)}
.sv-subject:focus-visible{outline:2px solid var(--sv-blue);outline-offset:2px}
.sv-subject .n{font-weight:600;font-size:14px}
.sv-subject .mix{grid-column:1 / -1}
`;

export function SubjectRow({
  label,
  count,
  shares,
  pressed = false,
  onPress,
  style,
}: SubjectRowProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  return (
    <button
      type="button"
      className="sv-subject"
      aria-pressed={pressed}
      onClick={onPress}
      style={style}
    >
      <span className="n">{label}</span>
      <StencilNumber value={count} height={13} offset={0} color="var(--sv-ink-3)" />
      <span className="mix">
        <MoodMix shares={shares} label={label} />
      </span>
    </button>
  );
}
