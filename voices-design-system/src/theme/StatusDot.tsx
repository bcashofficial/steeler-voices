/**
 * StatusDot — a mood as a radar blip: an 8px dot in the mood's color with
 * an ink ring, glowing in its own color, a faint outer ring around it and
 * a slow sweep in the mood's color circling it. The halo draws outside the
 * 8px footprint, so on a post card the dot sits on the title's baseline
 * without moving it. Its accessible name is the mood word unless a label
 * is given. Under reduced motion the sweep holds still.
 */

import { useEffect, type CSSProperties } from "react";

import { mountStyle } from "./styles";
import { moodByKey, type MoodKey } from "./vocab";

export interface StatusDotProps {
  mood: MoodKey;
  /** The accessible name; defaults to the mood word. */
  label?: string;
  size?: number;
  style?: CSSProperties;
}

const STYLE_ID = "sv-statusdot";
const CSS = `
.sv-statusdot{position:relative;display:inline-block;flex:none;width:var(--sv-statusdot-size);height:var(--sv-statusdot-size);border-radius:50%;background:var(--sv-statusdot);box-shadow:0 0 0 1px var(--sv-ink),0 0 calc(var(--sv-statusdot-size) * .75) calc(var(--sv-statusdot-size) * .12) color-mix(in srgb,var(--sv-statusdot) 55%,transparent);vertical-align:middle}
.sv-statusdot::before,.sv-statusdot::after{content:"";position:absolute;inset:calc(var(--sv-statusdot-size) * -.6);border-radius:50%;pointer-events:none}
.sv-statusdot::before{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--sv-statusdot) 32%,transparent)}
.sv-statusdot::after{background:conic-gradient(from 0deg,color-mix(in srgb,var(--sv-statusdot) 55%,transparent),transparent 90deg);-webkit-mask:radial-gradient(circle,transparent 52%,#000 56%);mask:radial-gradient(circle,transparent 52%,#000 56%);animation:sv-statusdot-sweep 2.8s linear infinite}
@keyframes sv-statusdot-sweep{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){.sv-statusdot::after{animation:none}}
`;

export function StatusDot({ mood, label, size = 8, style }: StatusDotProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  return (
    <i
      role="img"
      aria-label={label ?? moodByKey[mood].label}
      data-mood={mood}
      className="sv-statusdot"
      style={
        {
          "--sv-statusdot": moodByKey[mood].from,
          "--sv-statusdot-size": `${size}px`,
          ...style,
        } as CSSProperties
      }
    />
  );
}
