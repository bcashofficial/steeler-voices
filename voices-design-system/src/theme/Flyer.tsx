/**
 * Flyer — the week's program cover, shown first over the dimmed board.
 *
 * A flat 62% ink scrim (no blur: a backdrop blur over the fixed grain
 * layer mirrors the page in Chrome), and on it a 560px sheet on the
 * flyer's radius with a halftone fading from its top edge: the name in
 * Anton 58 with the gold offset, a DoubleRule, the matchup in Anton 34
 * with "at" in Helvetica Neue, three Numerals over micro caps (Posts ·
 * Comments · Subjects) that roll in when it opens, the top subjects with
 * their counts, the DoubleRule again, and "Open the board" as a TextLink.
 * It closes on that link, the scrim or Esc; the link takes focus on open.
 */

import { useEffect, useId, useRef, type CSSProperties, type MouseEvent } from "react";

import { DoubleRule } from "./DoubleRule";
import { formatCount } from "./format";
import { Numeral } from "./Numeral";
import { mountStyle } from "./styles";
import { TextLink } from "./TextLink";
import { palette, radius, typography } from "./tokens";
import { WORDS } from "./vocab";

export interface FlyerProps {
  open: boolean;
  onClose: () => void;
  /** The matchup, read "away at home". */
  game: { away: string; home: string };
  counts: { posts: number; comments: number; subjects: number };
  /** The week's top subjects, loudest first. */
  subjects: readonly { label: string; count: number }[];
  /** An eyebrow above the name, when the week has one. */
  week?: string;
  /** The name; the product name by default. */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-flyer";
const SCRIM = `color-mix(in srgb, ${palette.ink} 62%, transparent)`;
const HALFTONE = `color-mix(in srgb, ${palette.ink} 22%, transparent)`;
const { flyerTitle, matchup } = typography.scale;
const CSS = `
.sv-flyer-scrim{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;background:${SCRIM}}
.sv-flyer{position:relative;width:min(560px,100%);background:var(--sv-surface);color:var(--sv-ink);border-radius:${radius.flyer}px;box-shadow:var(--sv-shadow-lift);padding:26px 28px 22px;overflow:hidden;display:grid;gap:14px;font-family:${typography.body}}
.sv-flyer::before{content:"";position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(${HALFTONE} 1px,transparent 1.2px);background-size:5px 5px;opacity:.35;-webkit-mask-image:linear-gradient(180deg,#000,transparent 55%);mask-image:linear-gradient(180deg,#000,transparent 55%)}
.sv-flyer>*{position:relative}
.sv-flyer-week{font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:var(--sv-ink-2);text-align:center;margin-bottom:-8px}
.sv-flyer-title{margin:0;text-align:center;font-family:${typography.display};font-weight:400;letter-spacing:0.01em;font-size:${flyerTitle.fontSize}px;line-height:${flyerTitle.lineHeight};text-shadow:${typography.displayOffset} ${palette.gold}}
.sv-flyer-match{text-align:center;font-family:${typography.display};font-weight:400;letter-spacing:0.01em;font-size:${matchup.fontSize}px;line-height:${matchup.lineHeight}}
.sv-flyer-match i{font-style:normal;font-family:${typography.body};font-weight:500;font-size:18px;color:var(--sv-ink-2);margin:0 10px}
.sv-flyer-counts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.sv-flyer-subjects{display:flex;justify-content:center;gap:6px 18px;flex-wrap:wrap;font-size:13px}
.sv-flyer-subjects b{font-weight:600}
.sv-flyer-subjects span>span{color:var(--sv-ink-2);font-variant-numeric:tabular-nums;margin-left:4px}
.sv-flyer-foot{display:flex;justify-content:flex-end}
.sv-flyer-foot .sv-textlink{color:var(--sv-ink)}
@media (max-width:480px){.sv-flyer-title{font-size:44px}.sv-flyer-match{font-size:26px}}
`;

export function Flyer({
  open,
  onClose,
  game,
  counts,
  subjects,
  week,
  title = WORDS.productName,
  className,
  style,
}: FlyerProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const id = useId();
  const linkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    linkRef.current?.querySelector<HTMLElement>(".sv-textlink")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onScrim = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="sv-flyer-scrim" onClick={onScrim} data-open="true">
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className={["sv-flyer", className].filter(Boolean).join(" ")}
        style={style}
      >
        {week ? <div className="sv-flyer-week">{week}</div> : null}
        <h2 id={`${id}-title`} className="sv-flyer-title">
          {title}
        </h2>
        <DoubleRule />
        <div className="sv-flyer-match">
          {game.away} <i>{WORDS.at}</i> {game.home}
        </div>
        <div className="sv-flyer-counts">
          <Numeral value={counts.posts} caption={WORDS.posts} align="center" roll />
          <Numeral value={counts.comments} caption={WORDS.comments} align="center" roll />
          <Numeral value={counts.subjects} caption={WORDS.subjects} align="center" roll />
        </div>
        <div className="sv-flyer-subjects">
          {subjects.map((subject) => (
            <span key={subject.label}>
              <b>{subject.label}</b>
              <span>{formatCount(subject.count)}</span>
            </span>
          ))}
        </div>
        <DoubleRule />
        <div className="sv-flyer-foot" ref={linkRef}>
          <TextLink onClick={onClose}>{WORDS.openBoard}</TextLink>
        </div>
      </article>
    </div>
  );
}
