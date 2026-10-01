"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * Footer sticky-reveal. The footer is genuinely `position: sticky; bottom: 0`
 * — it stays anchored to the viewport while the foreground layer above it
 * (the final CTA) lifts away with rounded corners and a shadow, uncovering
 * it. No artificial blank scroll space; the reveal happens across the CTA's
 * own natural height as it scrolls past.
 */
export function FooterReveal({
  lifting,
  footer,
}: {
  lifting: ReactNode;
  footer: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0.55, 1], [0, -48]);
  const scale = useTransform(scrollYProgress, [0.55, 1], [1, 0.97]);
  const radius = useTransform(scrollYProgress, [0.55, 1], [0, 32]);
  const shadow = useTransform(
    scrollYProgress,
    [0.55, 1],
    [
      "0 0px 0px rgba(21,23,22,0)",
      "0 40px 70px -20px rgba(21,23,22,0.5)",
    ]
  );

  return (
    <div className="relative">
      <motion.div
        ref={ref}
        style={{
          y,
          scale,
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
          boxShadow: shadow,
        }}
        className="relative z-10 overflow-hidden bg-modus"
      >
        {lifting}
      </motion.div>
      <div className="sticky bottom-0 z-0">{footer}</div>
    </div>
  );
}
