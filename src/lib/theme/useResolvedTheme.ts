import { useSyncExternalStore } from "react";
import { useTheme } from "./context";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(DARK_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * The theme actually being rendered right now ("light" | "dark"), resolving
 * "system" against the live OS preference. Display-only — the CSS itself
 * already reacts to OS changes with zero JS (see globals.css); this hook
 * exists so UI (e.g. a theme switcher) can show "System (currently dark)"
 * rather than leaving "system" ambiguous to the visitor.
 */
export function useResolvedTheme(): "light" | "dark" {
  const { theme } = useTheme();
  const systemPrefersDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (theme === "system") return systemPrefersDark ? "dark" : "light";
  return theme;
}
