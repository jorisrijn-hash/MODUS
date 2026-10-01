"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { THEMES, THEME_LABEL } from "@/lib/theme/config";
import { useTheme } from "@/lib/theme/context";
import { dictFor, useDict, useLocale } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABEL } from "@/lib/i18n/config";
import { notify } from "@/components/system/notifications";
import { track } from "@/lib/chatbot";

/**
 * Checkpoint 5.5 — replaces the nav's previous literal inline text
 * ("Light / Dark / System (dark now)" + "EN / NL") with one compact icon
 * trigger. Same two preferences, same underlying contexts — only the
 * nav-bar presentation changes; `ThemeSwitch`/`LanguageSwitch` themselves
 * are untouched and still used verbatim elsewhere (footer, mobile menu,
 * the design-system page), where their fuller always-visible form is
 * still the right call.
 */
export function NavUtilityMenu({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const dict = useDict();

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function chooseLocale(next: typeof locale) {
    if (next === locale) return;
    setLocale(next);
    track("language_changed", { locale: next, source: "manual_switch" });
    notify(dictFor(next).notification.languageUpdated);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Preferences"
        className="flex h-8 w-8 items-center justify-center rounded text-graphite transition-colors hover:text-ink"
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 rounded border border-line bg-paper py-2 shadow-lg"
          >
            <p className="px-3 pb-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
              {dict.nav.theme}
            </p>
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors ${
                  theme === t ? "text-modus" : "text-graphite hover:text-ink"
                }`}
              >
                {THEME_LABEL[t]}
              </button>
            ))}
            <div className="my-1.5 border-t border-line" />
            <p className="px-3 pb-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
              {dict.language.switchLabel}
            </p>
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => chooseLocale(code)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors ${
                  locale === code ? "text-modus" : "text-graphite hover:text-ink"
                }`}
              >
                {LOCALE_LABEL[code]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
