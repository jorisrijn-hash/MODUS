/**
 * Shared motion tokens — Checkpoint 2 of the Master Redesign V2. The
 * single place durations/easings/springs are defined, so Motion, GSAP,
 * and any raw CSS transition all draw from the same values instead of
 * arbitrary per-component numbers. `EASE_STANDARD` is the exact curve
 * already used ad hoc throughout the existing codebase
 * (`[0.16, 1, 0.3, 1]`, aka `ease-modus` in tailwind.config.ts) — kept
 * identical rather than replaced, so nothing existing needs to change to
 * benefit from this layer.
 */

export const DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  cinematic: 1.1,
} as const;

// Cubic-bezier arrays, usable directly as a Motion `transition.ease` or
// spread into a GSAP `ease: "0.16, 1, 0.3, 1"`-style string via EASE_CSS.
export const EASE = {
  standard: [0.16, 1, 0.3, 1],
  enter: [0.22, 1, 0.36, 1],
  exit: [0.4, 0, 1, 1],
  morph: [0.65, 0, 0.35, 1],
  cinematic: [0.83, 0, 0.17, 1],
} as const;

// Same curves as CSS-consumable strings, for GSAP (`ease:
// EASE_CSS.standard`) and raw CSS transitions.
export const EASE_CSS = {
  standard: "cubic-bezier(0.16, 1, 0.3, 1)",
  enter: "cubic-bezier(0.22, 1, 0.36, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  morph: "cubic-bezier(0.65, 0, 0.35, 1)",
  cinematic: "cubic-bezier(0.83, 0, 0.17, 1)",
} as const;

export const SPRING = {
  subtle: { stiffness: 300, damping: 30, mass: 0.5 },
  responsive: { stiffness: 300, damping: 20, mass: 0.4 },
  expressive: { stiffness: 220, damping: 14, mass: 0.6 },
} as const;
