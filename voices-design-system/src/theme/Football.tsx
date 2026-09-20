/**
 * Football — the icon control beside the masthead: an ink ball with gold
 * seams and laces, 34×22. It tilts 8° on hover and reopens the flyer. It
 * is a button with nothing of a button about it: no box, no fill; its
 * accessible name is the label (by default, opening the week's flyer).
 */

import { useEffect, type CSSProperties } from "react";

import { mountStyle } from "./styles";
import { WORDS } from "./vocab";

export interface FootballProps {
  onClick?: () => void;
  /** The accessible name. */
  label?: string;
  /** Width in px; the height follows the ball's 34:22. */
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-football";
const CSS = `
.sv-football{background:none;border:0;padding:0 0 4px;margin:0;cursor:pointer;display:inline-flex;align-items:flex-end;color:var(--sv-ink)}
.sv-football svg{display:block;transform-origin:50% 60%}
.sv-football:hover svg{transform:rotate(-8deg)}
.sv-football:focus-visible{outline:2px solid var(--sv-blue);outline-offset:2px;border-radius:8px}
@media (prefers-reduced-motion: no-preference){.sv-football svg{transition:transform 200ms ease}}
`;

export function Football({
  onClick,
  label = WORDS.openFlyer,
  size = 34,
  className,
  style,
}: FootballProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  return (
    <button
      type="button"
      className={["sv-football", className].filter(Boolean).join(" ")}
      aria-label={label}
      onClick={onClick}
      style={style}
    >
      <svg viewBox="0 0 68 44" width={size} height={(size * 22) / 34} aria-hidden="true">
        <ellipse cx="34" cy="22" rx="31" ry="18" fill="var(--sv-ink-solid)" />
        <ellipse
          cx="34"
          cy="22"
          rx="31"
          ry="18"
          fill="none"
          stroke="var(--sv-gold)"
          strokeWidth="2"
        />
        <path
          d="M6 22 Q34 4 62 22"
          fill="none"
          stroke="var(--sv-gold)"
          strokeWidth="1.5"
          opacity=".6"
        />
        <path
          d="M6 22 Q34 40 62 22"
          fill="none"
          stroke="var(--sv-gold)"
          strokeWidth="1.5"
          opacity=".6"
        />
        <path d="M23 22 H45" stroke="var(--sv-gold)" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M27 18 V26 M32 18 V26 M37 18 V26 M42 18 V26"
          stroke="var(--sv-gold)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
