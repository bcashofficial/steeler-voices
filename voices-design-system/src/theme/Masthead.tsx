/**
 * Masthead — the name in Anton 46 with the gold offset, the Football
 * beside it, and a 3px ink rule under the whole line. The right slot
 * takes the chrome (the SectionMenu and the ThemeSwitch); the line wraps
 * on a narrow board.
 */

import { useEffect, type CSSProperties, type ReactNode } from "react";

import { Football } from "./Football";
import { mountStyle } from "./styles";
import { palette, typography } from "./tokens";
import { WORDS } from "./vocab";

export interface MastheadProps {
  /** The Football's click; without it the ball is still drawn. */
  onFootball?: () => void;
  /** The name; the product name by default. */
  title?: string;
  /** The right slot. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-masthead";
const { masthead } = typography.scale;
const CSS = `
.sv-masthead{display:grid;gap:10px;color:var(--sv-ink)}
.sv-masthead-line{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}
.sv-masthead-brand{display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap}
.sv-masthead-title{margin:0;font-family:${typography.display};font-weight:400;letter-spacing:0.01em;font-size:${masthead.fontSize}px;line-height:${masthead.lineHeight};color:var(--sv-ink);text-shadow:${typography.displayOffset} ${palette.gold}}
.sv-masthead-right{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.sv-masthead-rule{height:3px;background:var(--sv-ink)}
`;

export function Masthead({
  onFootball,
  title = WORDS.productName,
  children,
  className,
  style,
}: MastheadProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  return (
    <header className={["sv-masthead", className].filter(Boolean).join(" ")} style={style}>
      <div className="sv-masthead-line">
        <div className="sv-masthead-brand">
          <h1 className="sv-masthead-title">{title}</h1>
          <Football onClick={onFootball} />
        </div>
        {children ? <div className="sv-masthead-right">{children}</div> : null}
      </div>
      <div className="sv-masthead-rule" />
    </header>
  );
}
