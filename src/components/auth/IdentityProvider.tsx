"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { isClerkPubliclyConfigured } from "@/lib/auth/clerkConfig";

/**
 * Who the browser currently is, available everywhere without each caller
 * having to know whether Clerk is configured.
 *
 * `useAuth` throws outside `ClerkProvider`, and `ClerkProvider` is only
 * mounted when a publishable key exists — so callers could not simply
 * call it. The branch below is on a build-time constant, so the component
 * tree never switches shape at runtime and hook order stays stable.
 *
 * `identity` is the Clerk user id, or the literal `"guest"` when nobody
 * is signed in. It is deliberately a single string, because everything
 * that scopes stored state needs one key to compare — "guest" is an
 * identity like any other, which is what keeps a guest draft from leaking
 * into a signed-in session and vice versa.
 */
export type Identity = {
  /** Clerk user id, or "guest". `null` until Clerk has loaded. */
  identity: string | null;
  isLoaded: boolean;
};

const GUEST_ONLY: Identity = { identity: "guest", isLoaded: true };
const IdentityContext = createContext<Identity>(GUEST_ONLY);

function ClerkIdentityBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const value = useMemo<Identity>(
    // Deliberately null until loaded, never "guest". Treating the
    // not-yet-known state as a signed-out guest is what would briefly
    // show one account's saved state to another during the moment after a
    // switch, which is the whole failure this exists to prevent.
    () => ({ isLoaded, identity: isLoaded ? (userId ?? "guest") : null }),
    [isLoaded, userId]
  );
  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkPubliclyConfigured()) {
    return <IdentityContext.Provider value={GUEST_ONLY}>{children}</IdentityContext.Provider>;
  }
  return <ClerkIdentityBridge>{children}</ClerkIdentityBridge>;
}

export function useIdentity(): Identity {
  return useContext(IdentityContext);
}
