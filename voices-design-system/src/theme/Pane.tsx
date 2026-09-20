/**
 * Pane — a container that lifts when looked at. No border: transparent at
 * rest; on hover or focus within it takes the surface color, lifts on the
 * big shadow and rises 2px. `PaneBar` is its title line: a gold caret
 * square, the name, and a count in the corner.
 */

import { useEffect, type CSSProperties, type PropsWithChildren } from "react";

import { StencilNumber } from "./StencilNumber";
import { mountStyle } from "./styles";
import { motion, typography } from "./tokens";

export interface PaneBarProps {
  title: string;
  count?: number;
}

export interface PaneProps extends PropsWithChildren {
  bar?: PaneBarProps;
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-pane";
const CSS = `
.sv-pane{display:flex;flex-direction:column;min-width:0;border-radius:12px;background:transparent;transition:background ${motion.lift},box-shadow ${motion.lift},transform ${motion.lift}}
.sv-pane:hover,.sv-pane:focus-within{background:var(--sv-surface);box-shadow:var(--sv-shadow-lift);transform:translateY(-2px)}
.sv-pane-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px 4px}
.sv-pane-bar .t{display:flex;align-items:center;gap:8px;min-width:0;font-family:${typography.body};font-size:12px;font-weight:600;color:var(--sv-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sv-pane-caret{width:8px;height:8px;border-radius:2px;background:var(--sv-gold);box-shadow:inset 0 0 0 1px var(--sv-ink);flex:none}
.sv-pane-body{padding:10px 12px 14px;display:flex;flex-direction:column;gap:2px;min-width:0}
@media (prefers-reduced-motion: reduce){.sv-pane{transition:none}}
`;

export function PaneBar({ title, count }: PaneBarProps) {
  return (
    <div className="sv-pane-bar">
      <div className="t">
        <span className="sv-pane-caret" aria-hidden="true" />
        <span>{title}</span>
      </div>
      {count != null ? <StencilNumber value={count} height={26} offset={2} /> : null}
    </div>
  );
}

export function Pane({ bar, children, className, style }: PaneProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  return (
    <section className={["sv-pane", className].filter(Boolean).join(" ")} style={style}>
      {bar ? <PaneBar {...bar} /> : null}
      <div className="sv-pane-body">{children}</div>
    </section>
  );
}
