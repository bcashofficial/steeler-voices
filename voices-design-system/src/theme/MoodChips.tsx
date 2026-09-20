/**
 * MoodChips — the seven moods as a stack of color chips in a modal, over a
 * dimmed board. Each chip is a card in its mood's gradient: the product
 * name top-left, the gradient's two stops as its code bottom-left with the
 * mood word beneath. The highlighted chip lifts and wears an ink ring. The
 * chips deal in one by one; Esc, the backdrop and the cross close it.
 */

import { useEffect, useRef } from "react";

import { inkFor } from "./contrast";
import { mountStyle } from "./styles";
import { moodStops, motion, palette, typography } from "./tokens";
import { useVoicesTheme } from "./VoicesThemeContext";
import { MOODS, WORDS, type MoodKey } from "./vocab";

export interface MoodChipsProps {
  open: boolean;
  onClose: () => void;
  highlight?: MoodKey | null;
}

const STYLE_ID = "sv-mood-chips";
const CSS = `
.sv-chips-scrim{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;background:rgba(29,32,29,0.62)}
.sv-chips{position:relative;display:grid;gap:8px;width:min(340px,100%)}
.sv-chip{position:relative;height:84px;border-radius:6px;padding:11px 14px;display:grid;grid-template-rows:auto 1fr auto;box-shadow:0 1px 2px rgba(0,0,0,0.18),0 8px 22px rgba(0,0,0,0.22);transition:transform ${motion.lift},box-shadow ${motion.lift};animation:sv-chip-deal 360ms cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--sv-chip-i) * 45ms)}
.sv-chip[data-on="true"]{transform:scale(1.04);box-shadow:0 0 0 2px var(--sv-ink),0 14px 32px rgba(0,0,0,0.35);z-index:1}
.sv-chip .brand{font-family:${typography.body};font-size:12px;font-weight:700;letter-spacing:0.01em}
.sv-chip .code{font-family:${typography.body};font-size:10.5px;font-weight:500;letter-spacing:0.02em;opacity:.85}
.sv-chip .name{font-family:${typography.body};font-size:12.5px;font-weight:500}
.sv-chips-close{position:absolute;right:-6px;top:-40px;background:none;border:0;padding:6px;cursor:pointer;color:${palette.mist};border-radius:8px}
.sv-chips-close:hover{background:rgba(232,241,241,0.12)}
.sv-chips-close:focus-visible{outline:2px solid ${palette.blue};outline-offset:2px}
@keyframes sv-chip-deal{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.sv-chip{animation:none;transition:none}}
`;

export function MoodChips({ open, onClose, highlight = null }: MoodChipsProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const { mode } = useVoicesTheme();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sv-chips-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sv-chips" role="dialog" aria-modal="true" aria-label={WORDS.moods}>
        <button
          ref={closeRef}
          type="button"
          className="sv-chips-close"
          onClick={onClose}
          aria-label={WORDS.close}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path
              d="M4 4l12 12M16 4L4 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {MOODS.map((mood, index) => {
          const { from, to } = moodStops[mode][mood.key];
          const ink = inkFor(from);
          return (
            <div
              key={mood.key}
              className="sv-chip"
              data-mood={mood.key}
              data-on={mood.key === highlight}
              style={{
                background: `linear-gradient(90deg, ${from}, ${to})`,
                color: ink,
                ["--sv-chip-i" as string]: index,
              }}
            >
              <span className="brand">{WORDS.productName}</span>
              <span />
              <span style={{ display: "grid", gap: 1 }}>
                <span className="code">
                  {from.toUpperCase()} → {to.toUpperCase()}
                </span>
                <span className="name">{mood.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
