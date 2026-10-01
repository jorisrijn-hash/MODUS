"use client";

import { useRef } from "react";
import { useImageReveal } from "@/lib/motion/useImageReveal";

export function ImageRevealDemo() {
  const ref = useRef<HTMLDivElement>(null);
  useImageReveal(ref, { blurFocus: true });

  return (
    <div
      ref={ref}
      className="flex h-[280px] w-full max-w-lg items-center justify-center rounded-lg border border-line bg-mineral font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
      style={{ willChange: "clip-path, transform, filter" }}
    >
      clip-path wipe + scale settle + blur→focus
    </div>
  );
}
