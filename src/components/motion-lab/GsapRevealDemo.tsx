"use client";

import { useRef } from "react";
import { useGsapReveal, useDrift } from "@/lib/motion/gsapHooks";

export function GsapRevealDemo() {
  const cardARef = useRef<HTMLDivElement>(null);
  const cardBRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);

  useGsapReveal(cardARef);
  useGsapReveal(cardBRef, { start: "top 90%" });
  useDrift(driftRef, { distance: 18 });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div ref={cardARef} className="rounded-lg border border-line bg-paper p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">GSAP reveal A</p>
        <p className="mt-2 text-[14px] text-graphite">fade + rise + blur→focus, ScrollTrigger-driven, once.</p>
      </div>
      <div ref={cardBRef} className="rounded-lg border border-line bg-paper p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">GSAP reveal B</p>
        <p className="mt-2 text-[14px] text-graphite">Same primitive, a different trigger offset.</p>
      </div>
      <div className="relative col-span-full flex h-32 items-center justify-center overflow-hidden rounded-lg border border-line bg-mineral">
        <div ref={driftRef} className="rounded bg-modus px-4 py-2 text-[12px] font-medium text-modus-foreground">
          drift (restrained parallax)
        </div>
      </div>
    </div>
  );
}
