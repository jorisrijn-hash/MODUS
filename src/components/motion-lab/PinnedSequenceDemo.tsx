"use client";

import { useRef } from "react";
import { usePinnedSequence } from "@/lib/motion/gsapHooks";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const STEPS = [
  { label: "OBSERVE", body: "MODUS watches how the business actually operates, not how it's described." },
  { label: "DIAGNOSE", body: "Patterns are isolated into specific, named signals — not vague impressions." },
  { label: "IMPLEMENT", body: "A scoped change ships, tied to the exact signal that justified it." },
];

/**
 * Pinned multi-step scene (Section 5/9's "pinned scenes" requirement) —
 * the container pins for 150% of its own height while scroll scrubs a
 * single GSAP timeline that crossfades/shifts three panels. Reduced
 * motion: `usePinnedSequence` skips pinning entirely (see its own
 * comment) — this component instead just stacks all three steps in
 * normal document flow, fully visible, no scroll-lock.
 */
export function PinnedSequenceDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  usePinnedSequence(containerRef, (tl) => {
    STEPS.forEach((_, i) => {
      const selector = `[data-step="${i}"]`;
      if (i > 0) {
        tl.to(`[data-step="${i - 1}"]`, { opacity: 0, y: -24, duration: 0.3 }, i);
      }
      tl.fromTo(selector, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 24 }, { opacity: 1, y: 0, duration: 0.3 }, i);
    });
  });

  if (reducedMotion) {
    return (
      <div className="space-y-8">
        {STEPS.map((step) => (
          <div key={step.label}>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-modus">{step.label}</p>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-graphite">{step.body}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[70vh] overflow-hidden">
      {STEPS.map((step, i) => (
        <div key={step.label} data-step={i} className="absolute inset-0 flex flex-col justify-center" style={{ opacity: i === 0 ? 1 : 0 }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-modus">{step.label}</p>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-graphite">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
