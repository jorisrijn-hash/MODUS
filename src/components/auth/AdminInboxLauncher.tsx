"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isClerkPubliclyConfigured } from "@/lib/auth/clerkConfig";

/**
 * Opens the admin inbox in a second tab after an administrator signs in,
 * leaving the MODUS tab they started in exactly where it was.
 *
 * Who gets a tab is decided by the SERVER (`/api/admin/status`, which
 * answers only about the caller's own verified session), never by anything
 * the client can assert. Ordinary accounts and signed-out visitors get
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
  const { isLoaded, isSignedIn, userId } = useAuth();
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    // Never from inside the admin surface itself: that tab would spawn
    // another on every load.
    if (pathname?.startsWith("/private")) return;

    const key = storageKey(userId);
    const seen = readFlag(key);
    if (seen) {
      // Re-show the link if the tab was blocked earlier in this session,
      // but never try to open another one.
      if (seen === "blocked") setBlocked(true);
      return;
    }

    let cancelled = false;
    (async () => {
      let admin = false;
      try {
        const res = await fetch("/api/admin/status", { cache: "no-store" });
        admin = res.ok && (await res.json())?.admin === true;
      } catch {
        // A failed probe must not strand an admin without a way in, but it
        // also must not retry on every navigation. Treated as "not admin"
        // for this session; /private remains reachable directly.
        admin = false;
      }
      if (cancelled) return;

      if (!admin) {
        writeFlag(key, "not-admin");
        return;
      }

      // Mark BEFORE opening. If the open throws or the tab is blocked we
      // still must not try again on the next render.
      const opened = window.open("/private", "_blank", "noopener,noreferrer");
      if (opened) {
        writeFlag(key, "opened");
      } else {
        // Browsers routinely block a window.open that is not tied to a
        // user gesture, which is exactly the case straight after an OAuth
        // redirect. Offer a real link instead — a click on that is a
        // gesture, so it always opens.
        writeFlag(key, "blocked");
        setBlocked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, pathname]);

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
