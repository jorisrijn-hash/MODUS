export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

// Light is the default for a visitor with no stored preference, even when
// their operating system is in dark mode.
//
// This changed from "system". MODUS's light composition — warm #D7D7D0
// canvas, cream surfaces, deep green — is the designed presentation; the
// dark theme is a supported alternative, not an equal-footing default. A
// first-time visitor on a dark-mode laptop was landing on the alternative.
//
// It costs nothing at runtime: getInitialTheme() returns this when no
// cookie is present, so <html data-theme="light"> is in the very first
// server-rendered byte, and globals.css guards its
// prefers-color-scheme block with :not([data-theme="light"]). Pure CSS,
// no JS, no flash, no hydration mismatch.
//
// An explicit stored choice always wins, including "system" — the cookie
// is only ever written by setTheme(), i.e. when the visitor actually picks
// an option, so an existing "system" cookie is a real decision and is
// preserved rather than being treated as an unset default.
export const DEFAULT_THEME: Theme = "light";

export const THEME_COOKIE = "modus_theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isTheme(value: string | undefined | null): value is Theme {
  return !!value && (THEMES as readonly string[]).includes(value);
}

export const THEME_LABEL: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};
