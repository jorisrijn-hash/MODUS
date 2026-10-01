"use client";

import { useEffect, useState } from "react";
import { emailDomain, isFreeEmailDomain } from "@/lib/diagnostic/schema";

export type ClientSession = {
  email: string;
  name: string;
  company: string | null;
  signedInAt: number;
};

const STORAGE_KEY = "modus:client-session:v1";
const SESSION_EVENT = "modus:client-session:change";

// This whole module is a mock: the "Client Access" flow demonstrates what a
// logged-in platform state looks like on the marketing site, without a real
// backend, real email delivery, or a real account system behind it (that's
// the actual /private admin app, which is unrelated). The session is just
// localStorage plus a same-tab custom event so every mounted
// ClientUserButton (desktop nav + mobile nav) stays in sync — same pattern
// as src/lib/privacy/consent.ts and the chatbot's open/close event bus.
function titleCase(raw: string): string {
  return raw
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function deriveIdentity(email: string): { name: string; company: string | null } {
  const localPart = email.split("@")[0] ?? email;
  const name = titleCase(localPart) || email;
  if (isFreeEmailDomain(email)) return { name, company: null };
  const domain = emailDomain(email);
  const companyRaw = domain ? domain.split(".")[0] : null;
  return { name, company: companyRaw ? titleCase(companyRaw) : null };
}

export function getClientSession(): ClientSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClientSession) : null;
  } catch {
    return null;
  }
}

export function startClientSession(email: string): ClientSession {
  const { name, company } = deriveIdentity(email);
  const session: ClientSession = { email, name, company, signedInAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable (private browsing, quota) — session still applies
    // for this page view via the caller's own state.
  }
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  return session;
}

export function endClientSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function useClientSession(): ClientSession | null {
  // Lazy initializer, not an effect: reads localStorage on the client's
  // first render (same pattern as needsConsentDecision() in consent.ts),
  // so a returning visitor doesn't see a flash of "signed out" first.
  const [session, setSession] = useState<ClientSession | null>(() => getClientSession());

  useEffect(() => {
    const handler = () => setSession(getClientSession());
    window.addEventListener(SESSION_EVENT, handler);
    return () => window.removeEventListener(SESSION_EVENT, handler);
  }, []);

  return session;
}
