/**
 * ThemeSwitch — the other icon control: one 20px glyph, a moon in light
 * and a sun in dark, that swaps the theme through the provider. Its
 * accessible name says which way it will switch. On hover it takes the
 * hover tint on an 8px radius; nothing else of a button.
 */

import { useEffect, type CSSProperties } from "react";

import { mountStyle } from "./styles";
import { useVoicesTheme } from "./VoicesThemeContext";
import { WORDS } from "./vocab";

export interface ThemeSwitchProps {
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-themeswitch";
const CSS = `
.sv-themeswitch{background:none;border:0;padding:4px;margin:0;cursor:pointer;color:var(--sv-ink);display:inline-flex;border-radius:8px;transition:background 160ms ease}
.sv-themeswitch:hover{background:var(--sv-hover)}
.sv-themeswitch:focus-visible{outline:2px solid var(--sv-blue);outline-offset:2px}
.sv-themeswitch svg{width:20px;height:20px;display:block}
@media (prefers-reduced-motion: reduce){.sv-themeswitch{transition:none}}
`;

export function ThemeSwitch({ className, style }: ThemeSwitchProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const { mode, toggle } = useVoicesTheme();
  const dark = mode === "dark";
  return (
    <button
      type="button"
      className={["sv-themeswitch", className].filter(Boolean).join(" ")}
      aria-label={dark ? WORDS.switchToLight : WORDS.switchToDark}
      data-mode={mode}
      onClick={toggle}
      style={style}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}
