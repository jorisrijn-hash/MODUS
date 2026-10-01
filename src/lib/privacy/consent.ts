export type ConsentCategory = "analytics" | "marketing";

export type ConsentCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentState = {
  categories: ConsentCategories;
  version: string;
  decidedAt: number;
};

const STORAGE_KEY = "modus:consent:v1";

// Bump when the categories/purposes on offer change. A visitor whose
// stored version no longer matches is asked again, existing choices are
// not silently carried forward.
export const CONSENT_VERSION = "2026.01";

function readRaw(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function getConsent(): ConsentState | null {
  return readRaw();
}

export function needsConsentDecision(): boolean {
  const state = readRaw();
  return !state || state.version !== CONSENT_VERSION;
}

export function saveConsent(categories: Pick<ConsentCategories, "analytics" | "marketing">): ConsentState {
  const state: ConsentState = {
    categories: { necessary: true, ...categories },
    version: CONSENT_VERSION,
    decidedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private browsing, quota) — decision still
    // applies for this page view via the caller's own state.
  }
  return state;
}

export function acceptAll(): ConsentState {
  return saveConsent({ analytics: true, marketing: true });
}

export function rejectOptional(): ConsentState {
  return saveConsent({ analytics: false, marketing: false });
}

/** Gate for any future analytics/marketing initialization: nothing optional
 * runs before this returns true for that category. */
export function hasConsent(category: ConsentCategory): boolean {
  return readRaw()?.categories[category] ?? false;
}

const OPEN_PREFERENCES_EVENT = "modus:consent:open-preferences";

/** Lets the footer's "Privacy Preferences" link reopen the same dialog the
 * consent banner's "Manage" button opens, without lifting dialog state out
 * of ConsentBanner. */
export function openConsentPreferences() {
  window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT));
}

export function listenOpenConsentPreferences(cb: () => void) {
  window.addEventListener(OPEN_PREFERENCES_EVENT, cb);
  return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, cb);
}
