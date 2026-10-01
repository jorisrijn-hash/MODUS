"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger, ensureGsapRegistered } from "./gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { EASE_CSS } from "./tokens";

/**
 * Four small, purpose-built GSAP hooks — not a generic "animation config"
 * abstraction. Each owns exactly one job, each uses `gsap.context()`
 * scoped to the caller's ref so `.revert()` on unmount tears down every
 * tween and ScrollTrigger it created (and nothing else's), and each reads
 * this project's own `usePrefersReducedMotion()` (not GSAP's own
 * matchMedia helper) to match the established convention documented in
 * MODUS_REDESIGN_PLAN.md Section 4.
 */

/** Scroll-triggered fade+rise, GSAP's answer to the existing Motion
 * `<Reveal>` — for content that's choreographed as part of a larger GSAP
 * timeline elsewhere on the same page, where mixing in a separate Motion
 * component would fight the same scroll position from two systems. */
export function useGsapReveal(ref: RefObject<HTMLElement | null>, { start = "top 85%" }: { start?: string } = {}) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(el, { opacity: 1, y: 0, filter: "blur(0px)" });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y: 28, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: EASE_CSS.enter,
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [ref, reducedMotion, start]);
}

/** Pins the container for the scroll distance given, scrubbing a
 * caller-provided timeline builder against that pinned scroll range.
 * Under reduced motion, pinning is skipped entirely — content stays in
 * normal flow, fully visible, no scroll-locking. */
export function usePinnedSequence(
  ref: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline) => void,
  { end = "+=150%" }: { end?: string } = {}
) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end, scrub: 1, pin: true },
      });
      build(tl);
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, reducedMotion, end]);
}

/** Surrounding content softens (blur + dim) while the trigger element is
 * in its active scroll window, sharpening again on either side. */
export function useBlurFocusTransition(
  activeRef: RefObject<HTMLElement | null>,
  surroundingRef: RefObject<HTMLElement | null>
) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const active = activeRef.current;
    const surrounding = surroundingRef.current;
    if (!active || !surrounding || reducedMotion) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        surrounding,
        { filter: "blur(0px)", opacity: 1 },
        {
          filter: "blur(4px)",
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: active,
            start: "top 60%",
            end: "bottom 40%",
            scrub: true,
          },
        }
      );
    }, active);

    return () => ctx.revert();
  }, [activeRef, surroundingRef, reducedMotion]);
}

/** Extremely restrained vertical drift — a few percent of travel, not a
 * layered parallax scene. Disabled outright under reduced motion. */
export function useDrift(ref: RefObject<HTMLElement | null>, { distance = 24 }: { distance?: number } = {}) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -distance },
        {
          y: distance,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [ref, reducedMotion, distance]);
}
