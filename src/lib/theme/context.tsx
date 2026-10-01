"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { THEME_COOKIE, THEME_COOKIE_MAX_AGE, type Theme } from "./config";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persistThemeCookie(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    persistThemeCookie(next);
    if (typeof document !== "undefined") {
      // "system" intentionally sets the literal string, not a removed
      // attribute — globals.css's dark-mode media-query override is
      // written as :not([data-theme="light"]), which already treats
      // "system" and "absent" identically, so this stays consistent
      // with the server-rendered markup (see getInitialTheme) and never
      // causes a hydration mismatch.
      document.documentElement.dataset.theme = next;
    }
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
