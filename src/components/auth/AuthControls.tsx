"use client";

// Core 3 removed the SignedIn / SignedOut components in favour of
// <Show when="...">. The old ones are not merely deprecated: they throw at
// render, which 500s every page that mounts them. Caught by /diagnostic
// returning 500 across the suite.
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { isClerkPubliclyConfigured } from "@/lib/auth/clerkConfig";

/**
 * Sign-in / sign-up / account controls for the marketing navigation.
 *
 * Deliberately does NOT gate anything. The Free Diagnostic stays open to
 * guests: these controls only offer an account for saving and resuming,
 * and signing up grants no client or admin access on its own.
 */
export function AuthControls({
  className = "",
  variant = "desktop",
  onNavigate,
}: {
  className?: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  // Clerk's components throw without a publishable key. With none, the
  // account controls simply are not offered — the rest of the page, and
  // the guest diagnostic, are unaffected. Nothing is unlocked by this:
  // the server fails closed independently.
  if (!isClerkPubliclyConfigured()) return null;

  return (
    <span
      className={`flex items-center gap-2 ${variant === "mobile" ? "flex-wrap" : ""} ${className}`}
    >
      <Show when="signed-out">
        {variant === "mobile" ? (
          <>
            <Link
              href="/sign-in"
              onClick={onNavigate}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-modus px-5 text-sm text-white"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              onClick={onNavigate}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-line px-5 text-sm text-ink"
            >
              Create account
            </Link>
          </>
        ) : (
          <>
            <SignInButton mode="modal">
              <button
                type="button"
                data-chars-root=""
                className="relative inline-flex items-center rounded-full px-3 py-1.5 text-[13px] text-graphite transition-colors hover:text-ink"
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                data-chars-root=""
                className="relative hidden items-center rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink transition-colors hover:border-line-strong xl:inline-flex"
              >
                Create account
              </button>
            </SignUpButton>
          </>
        )}
      </Show>

      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              // Matches the nav's own control sizing so the avatar does
              // not change the capsule's height.
              avatarBox: "h-7 w-7",
            },
          }}
        />
      </Show>
    </span>
  );
}
