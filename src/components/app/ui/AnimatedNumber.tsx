"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Counts up from 0 to `value` once it scrolls into view. Reduced motion
 * renders the final value immediately, no animation.
 */
export function AnimatedNumber({
  value,
  format = (n: number) => Math.round(n).toLocaleString("nl-NL"),
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = usePrefersReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 24, mass: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!reducedMotion && inView) motionValue.set(value);
  }, [inView, value, motionValue, reducedMotion]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(v));
    return unsubscribe;
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(reducedMotion ? value : display)}
      {suffix}
    </span>
  );
}
