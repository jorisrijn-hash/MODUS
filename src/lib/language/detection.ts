const PROMPT_SHOWN_COOKIE = "modus_lang_prompt_shown";
const SCROLL_THRESHOLD = 0.3;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function markPromptShown() {
  document.cookie = `${PROMPT_SHOWN_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function browserLikelyDutch(): boolean {
  const languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  return languages.some((lang) => lang?.toLowerCase().startsWith("nl"));
}

/**
 * Section 02 of the brief: never switch automatically. Only ever consider
 * suggesting Dutch once, to a browser that looks Dutch, after the visitor
 * has manually never chosen a language and has scrolled far enough to
 * count as "meaningful engagement". Returns a cleanup function.
 */
export function watchForLanguageSuggestion(opts: {
  hasManualLocale: boolean;
  onEligible: () => void;
}): () => void {
  if (opts.hasManualLocale) return () => {};
  if (readCookie(PROMPT_SHOWN_COOKIE)) return () => {};
  if (typeof navigator === "undefined" || !browserLikelyDutch()) return () => {};

  let armed = true;

  function onScroll() {
    if (!armed) return;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (ratio >= SCROLL_THRESHOLD) {
      armed = false;
      window.removeEventListener("scroll", onScroll);
      opts.onEligible();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    armed = false;
    window.removeEventListener("scroll", onScroll);
  };
}

export function markLanguageSuggestionResolved() {
  markPromptShown();
}
