// The barrel — the one surface Module Federation exposes as `design_system/theme`.
// Adding a primitive is adding an export here and a section in voices-fe's playground.

export { VoicesTheme, THEME_STORAGE_KEY } from "./VoicesTheme";
export { useVoicesTheme, type VoicesThemeValue } from "./VoicesThemeContext";
export {
  palette,
  themes,
  moodStops,
  typography,
  spacing,
  radius,
  motion,
  layout,
  type ThemeMode,
  type ThemeTokens,
  type SemanticRole,
} from "./tokens";
export {
  MOODS,
  moodByKey,
  GROUPINGS,
  SECTIONS,
  WORDS,
  type Mood,
  type MoodKey,
  type GroupingKey,
  type SectionKey,
} from "./vocab";
export { FONT_FACE_CSS, FONT_FACE_STYLE_ID, mountFontFaces } from "./fonts";
export { buildBaseCss, mountBaseCss, applyThemeAttribute, BASE_STYLE_ID } from "./cssVariables";
export { buildGroundCss, mountGround, leatherTile, grainFilm, GROUND_STYLE_ID } from "./ground";
export { mountStyle, prefersReducedMotion } from "./styles";
export { useRollingNumber } from "./useRollingNumber";
export { LaughSticker, type LaughStickerProps } from "./LaughSticker";
export { PulseBar, type PulseBarProps, type PulseBarSize } from "./PulseBar";
export { tickColor, filledTicks, clampYards, describeMix, type MoodShare } from "./pulseMath";
export { Numeral, type NumeralProps, type NumeralSize } from "./Numeral";
export { formatCount } from "./format";
export { MoodSwatch, type MoodSwatchProps } from "./MoodSwatch";
export { MoodMix, type MoodMixProps } from "./MoodMix";
export { Scoreboard, type ScoreboardProps, type Reading } from "./Scoreboard";
export { StencilNumber, type StencilNumberProps } from "./StencilNumber";
export {
  DIGITS,
  COMMA,
  glyphFor,
  DIGIT_WIDTH,
  DIGIT_HEIGHT,
  DIGIT_STROKE,
  type Stroke,
} from "./digits";
export { inkFor } from "./contrast";
export { StatusDot, type StatusDotProps } from "./StatusDot";
