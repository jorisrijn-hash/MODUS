"use client";

// Core 3 removed the SignedIn / SignedOut components in favour of
// <Show when="...">. The old ones are not merely deprecated: they throw at
// render, which 500s every page that mounts them. Caught by /diagnostic
// returning 500 across the suite.
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

/**
 * Sign-in / sign-up / account controls for the marketing navigation.
 *
 * Deliberately does NOT gate anything. The Free Diagnostic stays open to
 * guests: these controls only offer an account for saving and resuming,
 * and signing up grants no client or admin access on its own.
 */
export function AuthControls({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Show when="signed-out">
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
