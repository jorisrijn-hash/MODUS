"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger, ensureGsapRegistered } from "./gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { EASE_CSS } from "./tokens";

/**
 * GSAP/ScrollTrigger media reveal (Checkpoint 2, Section 12) — a
 * clip-path wipe (bottom-to-top) plus a scale-settle (1.08 → 1.0), with
 * an optional blur→focus pass. Syncs correctly with Lenis because it
 * reads scroll position through ScrollTrigger, which LenisProvider keeps
 * updated via `lenis.on('scroll', ScrollTrigger.update)` rather than the
 * raw native scroll event.
 *
 * Reduced motion: reveals immediately at full visibility/scale/focus —
 * no wipe, no settle, no blur pass — per this checkpoint's instruction
 * not to rely on the global CSS media query alone; this hook checks
 * explicitly and skips creating the ScrollTrigger/tween entirely.
 */
export function useImageReveal(
  ref: RefObject<HTMLElement | null>,
  { blurFocus = false, start = "top 82%" }: { blurFocus?: boolean; start?: string } = {}
) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, filter: "blur(0px)" });
        return;
      }
      gsap.fromTo(
        el,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          scale: 1.08,
          filter: blurFocus ? "blur(10px)" : "blur(0px)",
        },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: EASE_CSS.cinematic,
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [ref, reducedMotion, blurFocus, start]);
}
