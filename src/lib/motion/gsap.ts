import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registered once per module instance. gsap.registerPlugin() is itself
// idempotent (GSAP's own design — safe to call repeatedly), but guarding
// here keeps intent explicit and avoids relying on that implementation
// detail, especially across Fast Refresh in dev where this module can
// re-evaluate.
//
// SplitText ships inside the installed `gsap` package (3.15.0) — it has
// been part of the core distribution since 3.13, so there is no separate
// dependency to add and, deliberately, no CDN script injected alongside
// the bundled copy. Verified in node_modules before relying on it:
// `config[type + "sClass"]` (linesClass/wordsClass/charsClass), `mask`,
// `autoSplit`, `onSplit` and `aria: "auto"` are all present in this
// version, and ScrollTrigger supports the `clamp()` start wrapper.
let registered = false;
export function ensureGsapRegistered() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
