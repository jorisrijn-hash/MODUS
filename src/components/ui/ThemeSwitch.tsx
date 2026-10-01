"use client";

import { THEMES, THEME_LABEL } from "@/lib/theme/config";
import { useTheme } from "@/lib/theme/context";
import { useResolvedTheme } from "@/lib/theme/useResolvedTheme";

/**
 * Light / Dark / System control — deliberately mirrors LanguageSwitch's
 * pattern exactly (mono labels in a row, active one underlined+accent,
 * inactive muted) rather than inventing a new interaction for a second
 * persistent preference switch. Not wired into any real page's chrome
 * yet — used on the Checkpoint 1 design-system test surface only; a real
 * Settings/nav placement is a later-checkpoint decision.
 */
export function ThemeSwitch({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const resolved = useResolvedTheme();

  return (
    <div
      className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] ${className}`}
      role="group"
      aria-label="Theme"
    >
      {THEMES.map((t, i) => (
        <span key={t} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-line" aria-hidden>
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => setTheme(t)}
            aria-current={theme === t ? "true" : undefined}
            className={`transition-colors ${
              theme === t ? "text-modus underline decoration-1 underline-offset-4" : "text-muted hover:text-ink"
            }`}
          >
            {THEME_LABEL[t]}
          </button>
        </span>
      ))}
      {theme === "system" && (
        <span className="text-muted normal-case">({resolved === "dark" ? "dark" : "light"} now)</span>
      )}
    </div>
  );
}
