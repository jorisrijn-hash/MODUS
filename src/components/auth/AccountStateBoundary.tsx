"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/components/auth/IdentityProvider";
import { purgeForeignContextReference } from "@/lib/customerContext/storage";

/**
 * Clears private state when the account changes.
 *
 * Scoped reads already stop one account's saved data being *shown* to
 * another, but that is not sufficient on its own:
 *
 *  - another account's capability token would stay in `localStorage`
 *    after they signed out, readable by anyone with the device;
 *  - server-rendered output already in the Next router cache was produced
 *    for the previous identity and would be reused on a Back navigation.
 *
 * So on every identity change this purges foreign stored state and asks
 * the router to re-fetch. Signing out is an identity change like any
 * other — "guest" is an identity here.
 *
 * The guest diagnostic DRAFT is deliberately left alone. It lives in
 * `sessionStorage` under its own key, holds answers the person at this
 * browser typed themselves, and is not account data; wiping it would
 * throw away work in progress for no safety gain.
 */
export function AccountStateBoundary() {
  const { identity, isLoaded } = useIdentity();
  const previous = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !identity) return;

    // Always purge, including on first load: a reference belonging to
    // someone else may be sitting in storage from a previous session in
    // this browser, with no identity change to trigger it.
    purgeForeignContextReference(identity);
    purgeForeignAdminFlags(identity);

    const changed = previous.current !== null && previous.current !== identity;
    previous.current = identity;

    if (changed) {
      // Drops cached RSC payloads rendered for the previous identity, so
      // Back does not resurrect their view.
      router.refresh();
    }
  }, [identity, isLoaded, router]);

  return null;
}

/**
 * Removes the admin-tab bookkeeping belonging to other accounts.
 *
 * Those keys are already per-account, so a stale one cannot make the tab
 * open for the wrong person. They are cleared anyway: leaving
 * `modus.adminInbox:user_…` behind discloses that a particular account
 * used this browser.
 */
function purgeForeignAdminFlags(identity: string) {
  try {
    const keep = `modus.adminInbox:${identity}`;
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("modus.adminInbox:") && key !== keep) sessionStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable — nothing was stored either.
  }
}
