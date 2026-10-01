"use client";

import { AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SystemSurface } from "@/components/system/SystemSurface";
import { useOverlaySlot } from "@/components/system/OverlayProvider";
import { useLocale } from "@/lib/i18n/context";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { markLanguageSuggestionResolved, watchForLanguageSuggestion } from "@/lib/language/detection";
import { notify } from "@/components/system/notifications";
import { track } from "@/lib/chatbot";

function hasManualLocaleCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${LOCALE_COOKIE}=`));
}

/**
 * This prompt only ever appears while the site is still rendering in
 * English (to a browser that looks Dutch), so its copy is fixed and
 * bilingual by design rather than driven by the current dictionary,
 * matching the brief's exact example verbatim.
 */
export function LanguagePrompt() {
  const pathname = usePathname();
  const { setLocale } = useLocale();
  const [eligible, setEligible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isPrivate = pathname?.startsWith("/private");

  useEffect(() => {
    if (isPrivate) return;
    return watchForLanguageSuggestion({
      hasManualLocale: hasManualLocaleCookie(),
      onEligible: () => setEligible(true),
    });
  }, [isPrivate]);

  const active = useOverlaySlot("languagePrompt", eligible && !dismissed && !isPrivate);

  function resolve(choice: "nl" | "en") {
    markLanguageSuggestionResolved();
    setLocale(choice);
    track("language_prompt_shown", {});
    track("language_changed", { locale: choice, source: "detection_prompt" });
    if (choice === "nl") notify("Taal bijgewerkt.");
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {active && (
        <SystemSurface label="Language / NL Detected" onClose={() => resolve("en")} closeLabel="Close">
          <p className="text-[13.5px] leading-relaxed text-graphite">
            Deze website is ook beschikbaar in het Nederlands.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => resolve("nl")}
              className="rounded bg-modus px-3.5 py-2 text-[13px] font-medium text-modus-foreground transition-colors hover:bg-modus-light"
            >
              Nederlands
            </button>
            <button
              type="button"
              onClick={() => resolve("en")}
              className="rounded border border-line px-3.5 py-2 text-[13px] text-graphite transition-colors hover:border-modus hover:text-modus"
            >
              Continue in English
            </button>
          </div>
        </SystemSurface>
      )}
    </AnimatePresence>
  );
}
