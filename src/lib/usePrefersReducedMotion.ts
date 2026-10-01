import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

// motion/react's own useReducedMotion() doesn't react to this correctly
// (verified live on the Loader: it stayed mounted at full height even with
// reduced motion emulated — a real hydration mismatch, not just a brief
// flash). useSyncExternalStore is the React-sanctioned way to read
// matchMedia specifically because it handles the
// server-snapshot-differs-from-client-snapshot case correctly.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}
