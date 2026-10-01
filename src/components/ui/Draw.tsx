"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";

/**
 * SVG path/line draw-in via `pathLength` — Motion supports this natively,
 * so it stays on Motion rather than pulling in GSAP's (paid) DrawSVGPlugin
 * for what's a single, common effect. A `<motion.g>` orchestrator, not a
 * new `<svg>` root — nest it inside the caller's own `<svg>` and give
 * each `<motion.path>` child `variants={drawPathVariants}` (no own
 * `initial`/`animate`, so it inherits this group's hidden/visible state
 * and the stagger below).
 */
export function Draw({
  children,
  stagger = 0.08,
  className = "",
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.g
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.g>
  );
}

export const drawPathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

export function drawTransition(duration = 1.1, delay = 0) {
  return { duration, delay, ease: [0.16, 1, 0.3, 1] as const };
}
