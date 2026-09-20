/**
 * VoicesTheme — the provider at the root of every consumer.
 *
 * Mounts the system's global layers exactly once per document (the font
 * faces, the `--sv-*` variables for both themes, the leather and grain
 * grounds) and owns the light/dark mode: read from storage, else the OS,
 * stamped on the document root as `data-theme`, remembered on change.
 */

import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { applyThemeAttribute, mountBaseCss } from "./cssVariables";
import { mountFontFaces } from "./fonts";
import { mountGround } from "./ground";
import { themes, type ThemeMode } from "./tokens";
import { VoicesThemeContext, type VoicesThemeValue } from "./VoicesThemeContext";

export const THEME_STORAGE_KEY = "steeler-voices-theme";

function readStoredMode(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function osMode(): ThemeMode {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface VoicesThemeProps extends PropsWithChildren {
  /** Force a mode (a test, a print view); otherwise storage then the OS. */
  mode?: ThemeMode;
}

export function VoicesTheme({ children, mode: forced }: VoicesThemeProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => forced ?? readStoredMode() ?? osMode());

  useEffect(() => {
    mountFontFaces();
    mountBaseCss();
    mountGround();
  }, []);

  useEffect(() => {
    applyThemeAttribute(mode);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable; the mode still applies for this page */
    }
  }, []);

  const toggle = useCallback(() => setMode(mode === "dark" ? "light" : "dark"), [mode, setMode]);

  const value = useMemo<VoicesThemeValue>(
    () => ({ mode, tokens: themes[mode], setMode, toggle }),
    [mode, setMode, toggle],
  );

  return <VoicesThemeContext.Provider value={value}>{children}</VoicesThemeContext.Provider>;
}
