"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Marketing page-transition foundation — Checkpoint 3, Section 10.
 * Deliberately minimal: a short (0.2s) opacity+blur crossfade on the
 * *incoming* page only, keyed by pathname, not a theatrical full-page
 * effect. Links themselves are unaffected — this only animates the
 * already-rendered destination page, it doesn't delay the navigation or
 * the click response. `usePathname()` updates correctly on browser
 * back/forward and direct navigation alike, so all three are covered by
 * the same mechanism without special-casing. Reduced motion: children
 * render directly, no wrapping motion element at all.
 *
 * Checkpoint 6 pre-task — `AnimatePresence` removed entirely, not just
 * reconfigured. This used to be `<AnimatePresence><motion.div
 * key={pathname} exit={...}>`, an exit+enter crossfade — the standard
 * recipe, and the shape this component had through Checkpoint 5. It had a
 * real, site-wide bug: after any client-side navigation, the *previous*
 * page's tree would intermittently stay mounted underneath the new one —
 * confirmed via Playwright on completely unrelated route pairs (e.g.
 * home→pricing), not anything specific to one page. Root-caused, not
 * guessed at: instrumenting `AnimatePresence`'s `onExitComplete` and the
 * exiting `motion.div`'s own `onAnimationComplete` showed the individual
 * exit animation genuinely finishes (fires its completion callback with
 * the correct end values) — but `AnimatePresence.onExitComplete` never
 * fires for it, so `AnimatePresence` never removes the exited node from
 * the tree. That's a bug in `AnimatePresence`'s own presence-bookkeeping,
 * not in this component's usage of it — confirmed independent of the
 * `mode` prop (`"popLayout"` and the default `"sync"` both showed the
 * identical failure, byte-for-byte, on the same deterministic
 * repro case: `/pricing` → `/` failed 5/5 under both).
 *
 * The fix is architectural, not a prop tweak: this component no longer
 * asks `AnimatePresence` to track an exiting tree at all. Next.js's own
 * router already unmounts the previous page's React tree correctly and
 * synchronously on navigation — `AnimatePresence` was only ever being
 * used here to *delay* that unmount for an exit fade. Removing it means
 * there is no exit animation (the old page simply disappears as
 * React/Next already does that job), and correspondingly nothing for a
 * presence-tracking bug to get wrong: a plain keyed `motion.div` remounts
 * on every pathname change and plays only an *enter* animation. Verified
 * via Playwright across `pricing→home`, `home→pricing`, `home→diagnostic`,
 * browser back/forward, rapid repeated navigation (5 clicks 150ms apart,
 * previously left up to 6 stacked page trees), and reduced motion — 21/21
 * checks now land at exactly one mounted page tree, where the
 * `AnimatePresence` version was reproducibly broken (deterministic 5/5 and
 * 3/3 failures on the same cases, both modes). See
 * `MODUS_REDESIGN_REPORT.md`'s Checkpoint 6 entry for the full
 * before/after evidence.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
