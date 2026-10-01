import type { ContextReference } from "./types";

const STORAGE_KEY = "modus:customer-context:v1";
const CONTEXT_EVENT = "modus:customer-context:change";

// Only a safe reference lives here (a capability token + the company name
// for optimistic display) — never raw Diagnostic answers. Once a Diagnostic
// is submitted, the server record is the source of truth; this is just
// enough to ask for it again. Same pattern as privacy/consent.ts.
export function getContextReference(): ContextReference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ContextReference) : null;
  } catch {
    return null;
  }
}

export function saveContextReference(contextToken: string, companyName: string): ContextReference {
  const ref: ContextReference = { contextToken, companyName, savedAt: Date.now() };
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

export function listenContextReferenceChange(cb: () => void) {
  window.addEventListener(CONTEXT_EVENT, cb);
  return () => window.removeEventListener(CONTEXT_EVENT, cb);
}
