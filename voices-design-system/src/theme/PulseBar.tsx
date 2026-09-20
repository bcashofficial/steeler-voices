/**
 * PulseBar — a voice's reading as a 100-yard field of ticks.
 *
 * Fifty ticks, two yards each, spread across whatever width the consumer
 * gives it; every fifth is taller (a ten-yard line).
 * The filled run takes the mood's gradient tick by tick, the rest sit in
 * the line color. Above it: a dot in the mood's color, the mood word
 * tracked in caps, and the yardage in a gold chip that rolls to its value.
 *
 * It plays: on mount the ticks rise in sequence; the head tick breathes on
 * the yard line; the cursor raises a wave of ticks as it passes over the
 * field. The laughing sticker sits at the end of the row on a voice read
 * as sarcasm. Under reduced motion it simply is.
 */

import { useEffect, useId, useRef, type CSSProperties, type MouseEvent } from "react";

import { LaughSticker } from "./LaughSticker";
import { clampYards, filledTicks, tickColor } from "./pulseMath";
import { mountStyle } from "./styles";
import { typography } from "./tokens";
import { useRollingNumber } from "./useRollingNumber";
import { moodByKey, WORDS, type MoodKey } from "./vocab";

export type PulseBarSize = "sm" | "md" | "lg";

export interface PulseBarProps {
  mood: MoodKey;
  /** 0–100. */
  yards: number;
  sarcasm?: boolean;
  size?: PulseBarSize;
  /** Ticks across the field; 50 means two yards a tick. */
  ticks?: number;
  /** Play the sequential fill on mount (default) or start already filled. */
  animate?: boolean;
  /** Replace the mood word with something else (a subject, a handle). */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-pulse";
const SIZES: Record<
  PulseBarSize,
  { tick: number; tall: number; width: number; gap: number; chip: number }
> = {
  sm: { tick: 12, tall: 16, width: 2, gap: 5, chip: 12 },
  md: { tick: 18, tall: 24, width: 2.5, gap: 6, chip: 13 },
  lg: { tick: 28, tall: 36, width: 3, gap: 8, chip: 15 },
};

const CSS = `
.sv-pulse{display:grid;gap:6px;min-width:0}
.sv-pulse-head{display:flex;align-items:center;gap:8px;min-height:20px}
.sv-pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--sv-pulse-from);flex:none}
.sv-pulse-label{font-family:${typography.body};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--sv-ink);white-space:nowrap}
.sv-pulse-chip{font-family:${typography.body};font-weight:600;font-variant-numeric:tabular-nums;background:var(--sv-gold);color:var(--sv-gold-ink);padding:2px 7px;border-radius:4px;line-height:1.3;white-space:nowrap}
.sv-pulse-field{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--sv-pulse-gap);width:100%;height:var(--sv-pulse-tall);cursor:default}
.sv-pulse-tick{display:block;flex:none;width:var(--sv-pulse-width);height:var(--sv-pulse-tick);border-radius:999px;background:var(--sv-line);transform-origin:bottom center;transition:transform 140ms ease,background 200ms ease;will-change:transform}
.sv-pulse-tick[data-tall="true"]{height:var(--sv-pulse-tall)}
.sv-pulse-tick[data-on="true"]{background:var(--sv-pulse-tick-color)}
.sv-pulse-tick[data-head="true"]{animation:sv-pulse-breathe 1.8s ease-in-out infinite}
.sv-pulse[data-animate="true"] .sv-pulse-tick{animation:sv-pulse-rise 360ms cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--sv-pulse-i) * 14ms)}
.sv-pulse[data-animate="true"] .sv-pulse-tick[data-head="true"]{animation:sv-pulse-rise 360ms cubic-bezier(.2,.8,.2,1) both,sv-pulse-breathe 1.8s ease-in-out infinite;animation-delay:calc(var(--sv-pulse-i) * 14ms),calc(var(--sv-pulse-i) * 14ms + 360ms)}
@keyframes sv-pulse-rise{from{transform:scaleY(0.15);opacity:.4}to{transform:scaleY(1);opacity:1}}
@keyframes sv-pulse-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.28)}}
@media (prefers-reduced-motion: reduce){.sv-pulse .sv-pulse-tick{animation:none!important;transition:none}}
`;

export function PulseBar({
  mood,
  yards,
  sarcasm = false,
  size = "sm",
  ticks = 50,
  animate = true,
  label,
  className,
  style,
}: PulseBarProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const fieldRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const { from, to, label: moodWord } = moodByKey[mood];
  const filled = filledTicks(yards, ticks);
  const shownYards = useRollingNumber(Math.round(clampYards(yards)));
  const dims = SIZES[size];

  const wave = (event: MouseEvent<HTMLDivElement>) => {
    const field = fieldRef.current;
    if (!field) return;
    const { left, width } = field.getBoundingClientRect();
    const cursorTick = ((event.clientX - left) / width) * ticks;
    field.querySelectorAll<HTMLElement>(".sv-pulse-tick").forEach((tick, index) => {
      const distance = (index - cursorTick) / 3;
      tick.style.transform = `scaleY(${1 + 0.9 * Math.exp(-distance * distance)})`;
    });
  };
  const settle = () => {
    fieldRef.current
      ?.querySelectorAll<HTMLElement>(".sv-pulse-tick")
      .forEach((tick) => tick.style.removeProperty("transform"));
  };

  const vars = {
    "--sv-pulse-from": from,
    "--sv-pulse-to": to,
    "--sv-pulse-tick": `${dims.tick}px`,
    "--sv-pulse-tall": `${dims.tall}px`,
    "--sv-pulse-width": `${dims.width}px`,
    "--sv-pulse-gap": `${dims.gap}px`,
    ...style,
  } as CSSProperties;

  return (
    <div
      className={["sv-pulse", className].filter(Boolean).join(" ")}
      data-animate={animate}
      style={vars}
    >
      <div className="sv-pulse-head">
        <span className="sv-pulse-dot" aria-hidden="true" />
        <span className="sv-pulse-label" id={`${id}-label`}>
          {label ?? moodWord}
        </span>
        <span className="sv-pulse-chip" style={{ fontSize: dims.chip }}>
          {shownYards} {WORDS.yd}
        </span>
        {sarcasm ? <LaughSticker size={size === "lg" ? 36 : 26} /> : null}
      </div>
      <div
        ref={fieldRef}
        className="sv-pulse-field"
        role="meter"
        aria-labelledby={`${id}-label`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clampYards(yards))}
        aria-valuetext={`${Math.round(clampYards(yards))} ${WORDS.yards}, ${moodWord}`}
        onMouseMove={wave}
        onMouseLeave={settle}
      >
        {Array.from({ length: ticks }, (_, index) => {
          const on = index < filled;
          return (
            <span
              key={index}
              className="sv-pulse-tick"
              data-on={on}
              data-tall={index % 5 === 0 || index === ticks - 1}
              data-head={on && index === filled - 1}
              style={
                {
                  "--sv-pulse-i": index,
                  "--sv-pulse-tick-color": on
                    ? tickColor(from, to, index, Math.max(filled, 1))
                    : undefined,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
