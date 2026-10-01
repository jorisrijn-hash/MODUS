export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

// Unlike locale (always defaults to English, never auto-follows the
// browser), theme defaults to "system" — respecting the visitor's OS
// preference by default is the conventional, accessibility-friendly
// choice for a rendering preference, whereas locale is a content-scope
// decision the project deliberately keeps manual-only. See
// MODUS_REDESIGN_REPORT.md's Checkpoint 1 entry for the reasoning.
export const DEFAULT_THEME: Theme = "system";

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
