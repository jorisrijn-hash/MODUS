"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, ensureGsapRegistered } from "./gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Reusable smooth-scroll provider — NOT mounted globally (see
 * MODUS_REDESIGN_PLAN.md's Checkpoint 0 recommendation: this belongs
 * inside a future `(marketing)` route-group layout, decided in
 * Checkpoint 3, never at root — `/app`/`/private` must never inherit
 * scroll-hijacking behavior). Whatever mounts this owns the decision of
 * where it applies.
 *
 * Reduced motion is handled explicitly, not left to Lenis's own
 * `respectReducedMotion` default (which still runs Lenis with lerp
 * forced to 1, still intercepting scroll) — per this checkpoint's own
 * instruction not to rely on implicit/global behavior, a visitor with
 * `prefers-reduced-motion: reduce` gets Lenis never constructed at all:
 * truly native scrolling, zero JS scroll interception.
 *
 * GSAP integration follows the documented Lenis+GSAP recipe exactly:
 * Lenis's own `autoRaf` stays off, and `lenis.raf()` is driven from
 * `gsap.ticker` instead of a second independent `requestAnimationFrame`
 * loop — this is the single RAF loop the whole page's scroll-linked
 * motion runs on. `ScrollTrigger.update` is wired to Lenis's `scroll`
 * event so pinned/scroll-driven GSAP timelines stay in sync with the
 * smoothed position, not the raw native scrollTop.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return; // native scrolling — Lenis never constructed

    ensureGsapRegistered();

    const lenis = new Lenis({
      anchors: true,
      stopInertiaOnNavigate: true,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      // gsap.ticker's `time` is seconds since ticker start; Lenis wants ms.
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
      // Any ScrollTriggers created by content that just unmounted are the
      // responsibility of that content's own gsap.context() cleanup (see
      // useGsapReveal.ts) — this provider only owns the Lenis/ticker
      // lifecycle, not other components' triggers.
      ScrollTrigger.refresh();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
