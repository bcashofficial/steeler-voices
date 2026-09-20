/**
 * The app's few layout rules, mounted once: the page's gutters, the board's
 * 75/25 split and its 1.55/1 pane group, and the stack below 980px. Every
 * number comes from the design system's layout tokens.
 */

import { layout, mountStyle } from "design_system/theme";

const STYLE_ID = "sv-app";
const CSS = `
.sv-app{max-width:1600px;margin:0 auto;padding:16px 20px 48px;display:grid;gap:14px}
.sv-split{display:grid;grid-template-columns:${layout.boardToRail};gap:16px;align-items:start}
.sv-panes{display:grid;grid-template-columns:${layout.threadToReadings};gap:20px;min-height:640px;align-items:stretch}
.sv-rail{display:grid;gap:10px;min-width:0}
.sv-side{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.sv-stack{display:grid;gap:4px}
@media (max-width:${layout.stackBelow}px){.sv-split,.sv-panes,.sv-side{grid-template-columns:1fr}.sv-app{padding:12px 16px 40px}}
`;

export function mountAppStyle(): void {
  mountStyle(STYLE_ID, CSS);
}
