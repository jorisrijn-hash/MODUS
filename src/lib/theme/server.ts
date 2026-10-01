import { cookies } from "next/headers";
import { DEFAULT_THEME, THEME_COOKIE, isTheme, type Theme } from "./config";

/**
 * Server-side initial theme, read from the persisted-preference cookie —
 * mirrors getInitialLocale()'s pattern exactly, so <html data-theme> can be
 * set correctly on the very first server-rendered byte with no client-side
 * flash/flip. An explicit "light"/"dark" choice renders deterministically;
 * "system" (including a first-ever visit, no cookie set) renders with no
 * data-theme-driven override at all — the CSS `prefers-color-scheme` media
 * query resolves it with zero JS and zero flash. See globals.css.
 */
export async function getInitialTheme(): Promise<Theme> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE)?.value;
  return isTheme(value) ? value : DEFAULT_THEME;
}
