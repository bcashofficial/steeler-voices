/**
 * The token registry as `--sv-*` CSS custom properties, one block per theme,
 * keyed by `data-theme` on the document root. Plain CSS, inline styles and
 * primitives all paint from these, so a theme switch is one attribute.
 */

import { leatherTile } from "./ground";
import { palette, themes, type ThemeMode, type ThemeTokens } from "./tokens";
import { MOODS } from "./vocab";

export const BASE_STYLE_ID = "sv-base";

const kebab = (key: string) => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

function declarations(tokens: ThemeTokens): string {
  const lines = Object.entries(tokens).map(([key, value]) => `--sv-${kebab(key)}:${value};`);
  lines.push(`--sv-leather:${leatherTile(tokens.leatherInk)};`);
  return lines.join("");
}

function paletteDeclarations(): string {
  const colors = Object.entries(palette).map(([key, value]) => `--sv-${key}:${value};`);
  const moods = MOODS.flatMap((mood) => [
    `--sv-mood-${mood.key}-from:${mood.from};`,
    `--sv-mood-${mood.key}-to:${mood.to};`,
  ]);
  return colors.concat(moods).join("");
}

export function buildBaseCss(): string {
  const light = declarations(themes.light);
  const dark = declarations(themes.dark);
  return (
    `:root{${paletteDeclarations()}${light}}` +
    `:root[data-theme="dark"]{${dark}}` +
    `body{margin:0;background:var(--sv-ground);color:var(--sv-ink);font-family:"Archivo","Helvetica Neue",Arial,sans-serif;font-size:14px;line-height:1.45;}`
  );
}

export function mountBaseCss(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(BASE_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = BASE_STYLE_ID;
  el.textContent = buildBaseCss();
  document.head.appendChild(el);
}

export function applyThemeAttribute(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
}
