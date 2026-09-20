import { createContext, useContext } from "react";

import type { ThemeMode, ThemeTokens } from "./tokens";

export interface VoicesThemeValue {
  mode: ThemeMode;
  tokens: ThemeTokens;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const VoicesThemeContext = createContext<VoicesThemeValue | null>(null);

/** The theme every primitive paints with. Throws outside a `VoicesTheme`. */
export function useVoicesTheme(): VoicesThemeValue {
  const value = useContext(VoicesThemeContext);
  if (!value) throw new Error("useVoicesTheme must be used inside <VoicesTheme>");
  return value;
}
