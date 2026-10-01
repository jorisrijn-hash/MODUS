"use client";

import { dictFor, useDict, useLocale } from "@/lib/i18n/context";
import { notify } from "@/components/system/notifications";
import { LOCALES, LOCALE_LABEL } from "@/lib/i18n/config";
import { track } from "@/lib/chatbot";

/**
 * The persistent "EN / NL" control. Deliberately not a dropdown: two mono
 * labels side by side, active one in ink/underlined, inactive one muted.
 * Reused as-is in desktop nav and inside the mobile menu.
 */
export function LanguageSwitch({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const { locale, setLocale } = useLocale();
  const dict = useDict();

  function choose(next: typeof locale) {
    if (next === locale) return;
    setLocale(next);
    track("language_changed", { locale: next, source: "manual_switch" });
    // Use the target locale's dictionary, not the current one: `dict` here
    // still reflects the pre-switch locale until the next render.
    notify(dictFor(next).notification.languageUpdated);
  }

  // "light" = light text for use on a dark/inverted background (the
  // footer). Fixed to inverted-foreground rather than paper this
  // checkpoint — paper is theme-relative since Checkpoint 1, so it would
  // silently become dark text under a dark site theme, exactly backwards
  // for a control meant to sit on an always-dark section. See
  // globals.css's --surface-inverted token comment for the full story.
  const activeClass = tone === "light" ? "text-modus-light" : "text-modus";
  const inactiveClass =
    tone === "light" ? "text-inverted-foreground/45 hover:text-inverted-foreground/80" : "text-muted hover:text-ink";
  const dividerClass = tone === "light" ? "text-inverted-foreground/20" : "text-line";

  return (
    <div
      className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] ${className}`}
      role="group"
      aria-label={dict.language.switchLabel}
    >
      {LOCALES.map((code, i) => (
        <span key={code} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className={dividerClass} aria-hidden>
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => choose(code)}
            aria-current={locale === code ? "true" : undefined}
            className={`transition-colors ${
              locale === code
                ? `${activeClass} underline decoration-1 underline-offset-4`
                : inactiveClass
            }`}
          >
            {LOCALE_LABEL[code]}
          </button>
        </span>
      ))}
    </div>
  );
}
