// The barrel — the one surface Module Federation exposes as `design_system/theme`.
// Adding a primitive is adding an export here and a section in voices-fe's playground.

export { VoicesTheme, THEME_STORAGE_KEY } from "./VoicesTheme";
export { useVoicesTheme, type VoicesThemeValue } from "./VoicesThemeContext";
export {
  palette,
  themes,
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
