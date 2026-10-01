"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoTile } from "@/components/ui/Logo";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Top-centre logo capsule that collapses to symbol-only on scroll.
 *
 * Measured source behaviour, used as the first fidelity target:
 *   condense when scrollY > 220 while expanded
 *   stay condensed until scrollY <= 110          (hysteresis, not a single
 *                                                 threshold — a single one
 *                                                 flickers when a user
 *                                                 hovers around it)
 *   expand again within the last 160px of available page scroll
 *   wordmark max-width 160px → 0, opacity 1 → 0, gap 8px → 0
 *   compact capsule 56px wide, effectively pill-shaped
 *   600ms cubic-bezier(0.65, 0, 0.35, 1) on width / max-width / opacity / gap
 *
 * The symbol stays visible throughout. This is a collapse, not a morph
 * between two different marks, and there is no logo easter egg.
 *
 * Centring: the wrapper is positioned at `left: 50%` with
 * `translateX(-50%)`, so the capsule contracts about its own centre and
 * the navigation groups either side never shift. That is the whole reason
 * the reference centres it rather than animating a left-aligned lockup.
 */
export function LogoLockup({ className = "" }: { className?: string }) {
  const [condensed, setCondensed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  // `condensed` is read inside a rAF callback that is created once; a ref
  // mirror avoids rebuilding the listener on every state flip (which would
  // otherwise detach/reattach the scroll handler twice per threshold).
  const condensedRef = useRef(false);

  useEffect(() => {
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Bottom expansion: within the last 160px of *available* scroll.
      // Guarded against short pages, where `max` can be 0 or negative and
      // every position would otherwise count as "near the bottom".
      const nearBottom = max > 320 && y >= max - 160;

      let next: boolean;
      if (nearBottom) next = false;
      else if (condensedRef.current) next = y > 110;
      else next = y > 220;

      if (next !== condensedRef.current) {
        condensedRef.current = next;
        setCondensed(next);
      }
    };

    // Evaluated immediately so a restored scroll position (reload partway
    // down the page, or a back-navigation) renders in the correct state on
    // the first paint rather than animating into it.
    evaluate();

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Page height changes (images, fonts, route content) move the
    // bottom-expansion boundary, so the capsule has to re-evaluate.
    const observer = new ResizeObserver(onScroll);
    observer.observe(document.documentElement);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  // Reduced motion changes state instantly rather than animating width.
  const transition = reducedMotion
    ? "none"
    : "max-width 600ms cubic-bezier(0.65,0,0.35,1), opacity 600ms cubic-bezier(0.65,0,0.35,1), gap 600ms cubic-bezier(0.65,0,0.35,1), padding 600ms cubic-bezier(0.65,0,0.35,1)";

  return (
    <div className={`pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 ${className}`}>
      <Link
        href="/"
        // One accessible name in both states. The wordmark span is
        // aria-hidden so a screen reader never hears "MODUS MODUS" in the
        // expanded state, and never loses the name in the condensed one.
        aria-label="MODUS"
        className="pointer-events-auto inline-flex items-center rounded-full border border-line/70 bg-surface/80 backdrop-blur-sm focus-visible:outline-2"
        style={{
          gap: condensed ? 0 : 8,
          paddingLeft: condensed ? 10 : 14,
          paddingRight: condensed ? 10 : 16,
          paddingTop: 8,
          paddingBottom: 8,
          transition,
        }}
      >
        {/* 20–24px for this mark: the reference's own symbol is 16px, but
            that is a different, simpler glyph. At 16px the four detached
            bars of this mark close up visually into a plus sign. */}
        <LogoTile className="h-[22px] w-[22px] shrink-0" />
        <span
          aria-hidden="true"
          className="overflow-hidden whitespace-nowrap font-sans text-[16px] font-medium leading-none tracking-[-0.01em] text-ink"
          style={{
            maxWidth: condensed ? 0 : 160,
            opacity: condensed ? 0 : 1,
            transition,
          }}
        >
          MODUS
        </span>
      </Link>
    </div>
  );
}
