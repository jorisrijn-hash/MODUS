import { useSyncExternalStore } from "react";

/**
 * Mock session for the /app showcase — presentation only, never real
 * authentication. No backend, no real credentials; any reasonable email +
 * password passes login, and the verification code is always 123456. See
 * BRIEF_CHECKLIST.md's "/app showcase" entry for the full reasoning.
 */
const STORAGE_KEY = "modus:app-demo-session:v1";
const CHANGE_EVENT = "modus:app-demo-session:change";

export const DEMO_OTP = "123456";

// "unknown" is a bootstrap-only state, never written to storage — it's
// what the server snapshot reports (real localStorage can't be read
// server-side). Consumers must treat "unknown" as "still checking, don't
// redirect yet", distinct from "signed_out" — otherwise a hard page load
// (page.goto, a real browser refresh) can bounce a genuinely signed-in
// visitor back to /app/login: useSyncExternalStore's first render always
// matches the server snapshot before the real client value syncs in, and
// a guard effect that treats that transient value as "signed_out" fires
// the redirect before the correction lands. Confirmed live via Playwright
// before this fix — see BRIEF_CHECKLIST.md's "/app showcase" entry.
export type SessionStage = "unknown" | "signed_out" | "awaiting_verification" | "signed_in";

function readStage(): "signed_out" | "awaiting_verification" | "signed_in" {
  if (typeof window === "undefined") return "signed_out";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "awaiting_verification" || raw === "signed_in" ? raw : "signed_out";
  } catch {
    return "signed_out";
  }
}

function writeStage(stage: "signed_out" | "awaiting_verification" | "signed_in") {
  try {
    window.localStorage.setItem(STORAGE_KEY, stage);
  } catch {
    // Storage unavailable — the current tab's own state still reflects it.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function startLogin() {
  writeStage("awaiting_verification");
}

export function completeVerification() {
  writeStage("signed_in");
}

export function signOut() {
  writeStage("signed_out");
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): SessionStage {
  return "unknown";
}

export function useSessionStage(): SessionStage {
  return useSyncExternalStore(subscribe, readStage, getServerSnapshot);
}
