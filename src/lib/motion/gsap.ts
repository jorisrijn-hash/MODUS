import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once per module instance. gsap.registerPlugin() is itself
// idempotent (GSAP's own design — safe to call repeatedly), but guarding
// here keeps intent explicit and avoids relying on that implementation
// detail, especially across Fast Refresh in dev where this module can
// re-evaluate.
let registered = false;
export function ensureGsapRegistered() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };
