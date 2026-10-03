import type { ContextReference } from "./types";

const STORAGE_KEY = "modus:customer-context:v1";
const CONTEXT_EVENT = "modus:customer-context:change";

/**
 * The saved reference to a submitted Diagnostic.
 *
 * Only a safe reference lives here (a capability token + the company name
 * for optimistic display) — never raw Diagnostic answers. Once a
 * Diagnostic is submitted, the server record is the source of truth; this
 * is just enough to ask for it again.
 *
 * Every read and write is scoped to an identity — a Clerk user id, or
 * "guest". It previously was not, which meant the reference survived sign
 * out and account switches: the next person at that browser was shown the
 * previous account's company name and offered their profile. Scoping it
 * makes that structurally impossible rather than something each caller
 * has to remember to check.
 */
export function getContextReference(identity: string | null): ContextReference | null {
  if (typeof window === "undefined") return null;
  // Identity not yet known (Clerk still loading). Returning the stored
  // reference here would show it for an instant before the account is
  // known, which is the flash this is meant to prevent.
  if (!identity) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const ref = JSON.parse(raw) as ContextReference;
    // A reference with no identity was written by an older build. It
    // cannot be attributed to anyone, so it is not returned to anyone.
    return ref.identity === identity ? ref : null;
  } catch {
    return null;
  }
}

export function saveContextReference(
  contextToken: string,
  companyName: string,
  identity: string
): ContextReference {
  const ref: ContextReference = { contextToken, companyName, savedAt: Date.now(), identity };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ref));
  } catch {
    // Storage unavailable (private browsing, quota) — the current tab's own
    // in-memory state still reflects the submission either way.
  }
  window.dispatchEvent(new CustomEvent(CONTEXT_EVENT));
  return ref;
}

export function clearContextReference() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CONTEXT_EVENT));
}

/**
 * Removes a stored reference that belongs to somebody else.
 *
 * Scoped reads already prevent it being *shown*, but leaving another
 * account's capability token in the browser after they have signed out is
 * not acceptable on its own — anyone with the device could read it out of
 * storage and call the public context endpoint with it.
 */
export function purgeForeignContextReference(identity: string | null) {
  if (typeof window === "undefined" || !identity) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const ref = JSON.parse(raw) as ContextReference;
    if (ref.identity !== identity) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(CONTEXT_EVENT));
    }
  } catch {
    // Unparseable: remove it rather than leave something unattributable.
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(CONTEXT_EVENT));
    } catch {
      // ignore
    }
  }
}

export function listenContextReferenceChange(callback: () => void) {
  const onChange = () => callback();
  window.addEventListener(CONTEXT_EVENT, onChange);
  // Another tab signing out or switching accounts must be reflected here
  // too, not only changes made in this one.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONTEXT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
