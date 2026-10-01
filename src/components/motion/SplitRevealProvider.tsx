"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Owns the masked-heading reveals for the marketing shell.
 *
 * Re-runs on route change (`PageTransition` remounts the tree, so the
 * previous headings are gone) and on locale change (the heading text
 * itself changes, so the old split is stale). Teardown reverts the split
 * DOM and kills the owned tweens and ScrollTriggers.
 *
 * Reduced motion never splits at all: the headings keep their original
 * markup and are simply readable.
 */
export function SplitRevealProvider() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let disposed = false;
    let teardown: (() => void) | undefined;

    (async () => {
      const { initSplitReveal, clearSplitPending } = await import("@/lib/motion/splitReveal");

      if (reducedMotion) {
        clearSplitPending();
        return;
      }

      try {
        // Split only once the real faces are in. Splitting into lines
        // before that measures a fallback face, so the line breaks bake in
        // wrong and never correct themselves.
        await document.fonts.ready;
      } catch {
        // A font-loading failure must not stop the headings being shown.
      }
      if (disposed) {
        clearSplitPending();
        return;
      }

      try {
        teardown = initSplitReveal();
      } catch {
        // Plugin or split failure: fall back to plain, complete headings
        // rather than leaving anything hidden.
      } finally {
        clearSplitPending();
      }
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [pathname, locale, reducedMotion]);

  return null;
}
