import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { CATEGORY_IDS, HIDDEN_Z, PRODUCTION_OFFSET } from "./stackGeometry";
import type { StackState } from "./stackScene";

/**
 * The single reversible scroll timeline.
 *
 * One timeline, total virtual duration 2.7 units, mapped onto the
 * section's own scroll travel by ScrollTrigger. The durations are
 * scroll-mapped, not wall-clock: nothing here plays on its own.
 *
 *   start  dur  action
 *   0      0.4  root → (−0.48, −0.36) rad; production offset 601 → 133
 *   0.4    0.5  improvements  Z −400 → 0
 *   0.47   0.5  insight       Z −400 → 0
 *   0.54   0.5  identity      Z −400 → 0
 *   1.0    0.4  production offset 133 → 0
 *   1.4+   0.4  each category cell, staggered by 0.04
 *   2.0    0.7  root rotations → 0, final flat front view
 *
 * The overlaps are intentional: the last categories are still arriving as
 * the diagram begins to flatten. Scrubbing backwards reverses these same
 * tweens — there is no separate reverse animation, which is what keeps
 * every intermediate state exactly recoverable.
 *
 * `scrub: 0.6` is catch-up smoothing, not a duration.
 *
 * Pinning is CSS sticky on the scene column. ScrollTrigger must NOT also
 * pin it: double-pinning produces a scene that lags its own container by a
 * frame and fights the sticky ancestor.
 */
export function createStackTimeline(
  trigger: Element,
  state: StackState,
  onUpdate: () => void
): gsap.core.Timeline {
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
    },
    onUpdate,
  });

  tl.to(state, { rotationX: -0.48, rotationY: -0.36, duration: 0.4 }, 0);
  tl.to(state, { productionOffset: 133, duration: 0.4 }, 0);

  tl.to(state.z, { improvements: 0, duration: 0.5 }, 0.4);
  tl.to(state.z, { insight: 0, duration: 0.5 }, 0.47);
  tl.to(state.z, { identity: 0, duration: 0.5 }, 0.54);

  tl.to(state, { productionOffset: 0, duration: 0.4 }, 1.0);

  CATEGORY_IDS.forEach((id, i) => {
    tl.to(state.z, { [`category-${id}`]: 0, duration: 0.4 }, 1.4 + 0.04 * i);
  });

  // The flatten segment keeps its original 2.0 → 2.7 placement even though
  // there are five cells instead of nine. Shortening the timeline to match
  // the shorter stagger would change the scroll mapping of every earlier
  // beat as well.
  tl.to(state, { rotationX: 0, rotationY: 0, duration: 0.7 }, 2.0);

  return tl;
}

/** Initial values, applied before the trigger is attached so no hidden layer flashes. */
export function resetStackState(state: StackState): void {
  state.rotationX = 0;
  state.rotationY = 0;
  state.productionOffset = PRODUCTION_OFFSET;
  for (const key of Object.keys(state.z)) {
    state.z[key] = key === "team" || key === "production" ? 0 : HIDDEN_Z;
  }
}

export { ScrollTrigger };
