"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LogoMark } from "@/components/ui/Logo";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type Stage = "line" | "ready" | "open" | "done";

/**
 * First-load intro reveal — kept for Checkpoint 3 (Section 13), simplified
 * only by the theme-token fix below, not rebuilt. It's a real brand
 * moment (the MODUS mark confidently opening the site), not a functional
 * loading indicator masking real latency — content behind it is already
 * rendered, this is purely presentational and unmounts itself on a fixed
 * timeline, not tied to any actual load state.
 *
 * Deliberately uses the fixed `inverted`/`inverted-foreground` tokens
 * (see globals.css's --surface-inverted comment), not the theme-relative
 * `ink`/`paper` it used before Checkpoint 1's dark mode existed — a
 * reveal curtain that turned white under a dark site theme (which
 * `bg-ink` would now do, since dark mode's `ink` is near-white) read as
 * broken, not "theme-aware" in any useful sense. A confident dark curtain
 * regardless of the visitor's theme preference is the more coherent read
 * of "theme-aware" here: it no longer breaks, rather than it now
 * inverts. Flagged as a real design decision in the report, not an
 * unstated default.
 */
export function Loader() {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<Stage>("line");
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (reduceMotion) return;
    const t1 = window.setTimeout(() => setStage("ready"), 700);
    const t2 = window.setTimeout(() => setStage("open"), 1200);
    const t3 = window.setTimeout(() => setStage("done"), 1900);
    const t4 = window.setTimeout(() => setMounted(false), 2300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [reduceMotion]);

  const opening = stage === "open" || stage === "done";

  // Checkpoint 3: this note is now stale in one respect and confirmed in
  // another. Loader no longer mounts at root at all — it's mounted only
  // inside src/app/(marketing)/layout.tsx, so it's structurally
  // impossible for it to render on /private or /app regardless of this
  // pathname check (kept below only because it's now dead code removal
  // risk outweighs the near-zero cost of leaving a redundant guard; see
  // MODUS_REDESIGN_REPORT.md's Checkpoint 3 entry). What *is* still true
  // and still relevant: because it's a route-group layout (not a root
  // provider, not a per-page mount), Next only mounts it once per full
  // page load — client-side navigation between marketing pages does NOT
  // remount the layout, so this intro reveal correctly does not replay
  // on every route change. Verified live, not assumed.
  const isAdminApp = pathname?.startsWith("/private") && pathname !== "/private/login";
  if (isAdminApp) return null;

  return (
    <AnimatePresence>
      {mounted && !reduceMotion && (
        <div className="fixed inset-0 z-[100]" aria-hidden>
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: opening ? "-100%" : 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 bg-inverted"
          >
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1, opacity: stage === "done" ? 0 : 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "center" }}
              className="absolute inset-y-0 right-0 w-px bg-modus-light"
            />
          </motion.div>
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: opening ? "100%" : 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-y-0 right-0 w-1/2 bg-inverted"
          >
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1, opacity: stage === "done" ? 0 : 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "center" }}
              className="absolute inset-y-0 left-0 w-px bg-modus-light"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: opening ? 0 : 1 }}
            transition={{ duration: 0.25 }}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 border border-modus-light bg-inverted px-8 py-6"
          >
            <LogoMark tone="invert" className="h-6 w-6" />
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-inverted-foreground/60">
              {stage === "line" ? "MODUS / Initializing" : "System Ready"}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
