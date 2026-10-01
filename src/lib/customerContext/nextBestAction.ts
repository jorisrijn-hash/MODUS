import type { LifecycleState, NextBestAction } from "./types";

/**
 * Deterministic, and deliberately small: only maps the states this app can
 * actually produce (see types.ts). Extend the switch when a new lifecycle
 * state has a real feature behind it, not before.
 */
export function nextBestAction(state: LifecycleState, proposalUrl?: string | null): NextBestAction {
  switch (state) {
    case "PROPOSAL_READY":
      // Falls through to the profile if the caller didn't pass a URL —
      // shouldn't happen (this state is only ever derived FROM a
      // non-null proposalUrl), but never link to "/" over that mismatch.
      return { id: "VIEW_PROPOSAL", href: proposalUrl ?? "/diagnostic" };
    case "DIAGNOSTIC_STARTED":
      return { id: "CONTINUE_DIAGNOSTIC", href: "/diagnostic" };
    case "PROFILE_READY":
      return { id: "VIEW_PROFILE", href: "/diagnostic" };
    case "ANONYMOUS":
    default:
      return { id: "RUN_DIAGNOSTIC", href: "/diagnostic" };
  }
}
