"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useIdentity } from "@/components/auth/IdentityProvider";
import { isClerkPubliclyConfigured } from "@/lib/auth/clerkConfig";

/**
 * Opens the admin inbox in a second tab after an administrator signs in,
 * leaving the MODUS tab they started in exactly where it was.
 *
 * Who gets a tab is decided by the SERVER (`/api/admin/status`, which
 * answers only about the caller's own verified session), never by anything
 * the client can assert — and never merely because somebody signed in.
 * Membership is confirmed for the CURRENT account before the tab opens:
 * a result that arrives after the account has changed is discarded, and
 * any conclusion reached for a previous account is cleared the instant
 * the identity changes. Ordinary accounts and signed-out visitors get
 * nothing at all and stay in the normal flow — for them this component
 * makes one cached probe and then does nothing for the rest of the
 * session.
 *
 * The tab is a convenience, not a grant. `/private` re-checks Clerk
 * identity and current `AdminMember` membership on every request, so a
 * tab opened by any means still lands on sign-in unless the membership is
 * real and current.
 */

type Probe = "opened" | "blocked" | "not-admin";

/** Per-session, per-account, so a refresh does not open a second tab. */
function storageKey(userId: string) {
  return `modus.adminInbox:${userId}`;
}

function readFlag(key: string): Probe | null {
  try {
    return (sessionStorage.getItem(key) as Probe | null) ?? null;
  } catch {
    // Private mode or blocked storage. Falling back to null would reopen
    // the tab on every navigation, so treat it as already handled.
    return "not-admin";
  }
}

function writeFlag(key: string, value: Probe) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Nothing to do — the in-memory guard below still prevents a repeat
    // within this page's lifetime.
  }
}

export function AdminInboxLauncher() {
  const { identity, isLoaded } = useIdentity();
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);
  // The account the currently-shown state belongs to. Compared on every
  // async result so nothing decided under a previous account can act.
  const decidedFor = useRef<string | null>(null);

  useEffect(() => {
    // Identity changed (including a sign-out): drop any membership
    // conclusion reached for the previous account immediately, before any
    // new probe runs. Leaving it would show the previous admin's "Open
    // admin inbox" offer to whoever signed in next.
    if (decidedFor.current !== null && decidedFor.current !== identity) {
      setBlocked(false);
    }
    decidedFor.current = identity;
  }, [identity]);

  useEffect(() => {
    if (!isLoaded || !identity || identity === "guest") return;
    // Never from inside the admin surface itself: that tab would spawn
    // another on every load.
    if (pathname?.startsWith("/private")) return;

    const key = storageKey(identity);
    const seen = readFlag(key);
    if (seen) {
      if (seen === "blocked") setBlocked(true);
      return;
    }

    // Captured at request time. A probe started under one account can
    // resolve after a switch, and acting on that answer is exactly how a
    // tab would open for someone who is not an admin.
    const startedFor = identity;
    let cancelled = false;

    (async () => {
      let admin = false;
      try {
        const res = await fetch("/api/admin/status", { cache: "no-store" });
        admin = res.ok && (await res.json())?.admin === true;
      } catch {
        admin = false;
      }
      // Three guards, all required: the effect is still current, the
      // account has not changed since the request began, and the answer
      // was yes.
      if (cancelled || startedFor !== decidedFor.current) return;

      if (!admin) {
        writeFlag(key, "not-admin");
        return;
      }

      const opened = window.open("/private", "_blank", "noopener,noreferrer");
      if (opened) {
        writeFlag(key, "opened");
      } else {
        writeFlag(key, "blocked");
        setBlocked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, identity, pathname]);

  if (!blocked) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 px-4">
      <div className="flex items-center gap-3 rounded-full border border-line bg-surface/95 px-4 py-2.5 shadow-sm backdrop-blur-sm">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          MODUS / Admin
        </span>
        <a
          href="/private"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium text-ink underline underline-offset-4 hover:text-modus"
        >
          Open admin inbox
        </a>
        <button
          type="button"
          onClick={() => setBlocked(false)}
          aria-label="Dismiss"
          className="text-[13px] text-graphite hover:text-ink"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/** Mounted only where Clerk can actually report a session. */
export function AdminInboxLauncherGate() {
  if (!isClerkPubliclyConfigured()) return null;
  return <AdminInboxLauncher />;
}
