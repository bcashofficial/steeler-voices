/**
 * Design tokens — the single source of every visual value in Steeler Voices.
 * Transcribed from the approved board sheet (DESIGN.md); not opinions.
 *
 * Five colors from the coolors.co scheme, two grounds (pure white, the ink),
 * two faces (Anton for display, Archivo for everything else). Every primitive
 * reads these through `VoicesTheme` or the `--sv-*` CSS variables it mounts.
 */

export const palette = {
  ink: "#1D201D",
  gold: "#F5E571",
  mist: "#E8F1F1",
  blue: "#2374AB",
  olive: "#697A21",
  white: "#FFFFFF",
} as const;

export type ThemeMode = "light" | "dark";

/** What each theme resolves the semantic roles to. Ink hierarchy on either
 *  ground is alpha on the ink color — three steps, no more. */
export const themes = {
  light: {
    ground: palette.white,
    surface: palette.white,
    ink: palette.ink,
    ink2: "rgba(29, 32, 29, 0.64)",
    ink3: "rgba(29, 32, 29, 0.42)",
    line: "rgba(29, 32, 29, 0.16)",
    lineStrong: "rgba(29, 32, 29, 0.32)",
    field: palette.mist,
    hover: "rgba(29, 32, 29, 0.05)",
    inkSolid: palette.ink,
    goldInk: palette.ink,
    mist: palette.mist,
    shadow: "0 1px 2px rgba(29, 32, 29, 0.06), 0 6px 20px rgba(29, 32, 29, 0.10)",
    shadowLift: "0 2px 4px rgba(29, 32, 29, 0.08), 0 14px 32px rgba(29, 32, 29, 0.16)",
    grainOpacity: 0.11,
    leatherOpacity: 0.06,
    leatherInk: palette.ink,
    grainBlend: "multiply",
  },
  dark: {
    ground: palette.ink,
    surface: "#262A26",
    ink: palette.mist,
    ink2: "rgba(232, 241, 241, 0.66)",
    ink3: "rgba(232, 241, 241, 0.42)",
    line: "rgba(232, 241, 241, 0.14)",
    lineStrong: "rgba(232, 241, 241, 0.30)",
    field: "rgba(232, 241, 241, 0.08)",
    hover: "rgba(232, 241, 241, 0.06)",
    inkSolid: palette.mist,
    goldInk: palette.ink,
    mist: "#2E332E",
    shadow: "0 1px 2px rgba(0, 0, 0, 0.30), 0 6px 20px rgba(0, 0, 0, 0.35)",
    shadowLift: "0 2px 4px rgba(0, 0, 0, 0.40), 0 14px 32px rgba(0, 0, 0, 0.50)",
    grainOpacity: 0.077,
    leatherOpacity: 0.07,
    leatherInk: palette.mist,
    grainBlend: "screen",
  },
} as const;

export type ThemeTokens = (typeof themes)[ThemeMode];

/** The two stops of each mood's gradient, per theme. Pairs share a hue and
 *  differ in where the gradient goes; a stop that would vanish on one
 *  ground (pale gold on white) is deepened there. Heated starts on the
 *  theme's ink. */
export const moodStops = {
  light: {
    hyped: { from: palette.gold, to: "#C9B52E" },
    hopeful: { from: palette.gold, to: palette.olive },
    proud: { from: palette.blue, to: "#6FB4E8" },
    level: { from: palette.blue, to: "#8FAEC4" },
    uneasy: { from: palette.olive, to: "#AEBF58" },
    frustrated: { from: palette.olive, to: "#3A3F1A" },
    heated: { from: palette.ink, to: palette.blue },
  },
  dark: {
    hyped: { from: palette.gold, to: "#FFF6B0" },
    hopeful: { from: palette.gold, to: palette.olive },
    proud: { from: palette.blue, to: "#6FB4E8" },
    level: { from: palette.blue, to: "#9DB9CC" },
    uneasy: { from: palette.olive, to: "#AEBF58" },
    frustrated: { from: palette.olive, to: "#3A3F1A" },
    heated: { from: palette.mist, to: palette.blue },
  },
} as const;
export type SemanticRole = keyof ThemeTokens;

export const typography = {
  display: '"Anton", Impact, "Arial Narrow Bold", sans-serif',
  body: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  /** Anton is one weight; the gold offset is the display face's signature. */
  displayOffset: "3px 3px 0",
  displayOffsetSmall: "2px 2px 0",
  scale: {
    masthead: { fontSize: 46, lineHeight: 0.9 },
    flyerTitle: { fontSize: 58, lineHeight: 0.9 },
    numeral: { fontSize: 54, lineHeight: 0.85 },
    numeralMd: { fontSize: 40, lineHeight: 1 },
    numeralSm: { fontSize: 30, lineHeight: 1 },
    matchup: { fontSize: 34, lineHeight: 1 },
    title: { fontSize: 15, lineHeight: 1.45, fontWeight: 600 },
    body: { fontSize: 14, lineHeight: 1.45, fontWeight: 400 },
    small: { fontSize: 12, lineHeight: 1.4, fontWeight: 500 },
    micro: { fontSize: 11, lineHeight: 1.3, fontWeight: 600, letterSpacing: "0.1em" },
  },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

export const radius = { sm: 8, md: 12, flyer: 6, pill: 999 } as const;

export const motion = {
  underline: "160ms ease",
  lift: "180ms ease",
  roll: "420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

/** The board's proportions: board to rail, thread to readings. */
export const layout = {
  boardToRail: "3fr 1fr",
  threadToReadings: "1.55fr 1fr",
  masonryColumn: 200,
  stackBelow: 980,
} as const;
