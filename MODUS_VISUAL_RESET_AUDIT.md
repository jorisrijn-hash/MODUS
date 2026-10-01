# MODUS Visual Reset Audit

What the old presentation was, what replaces it, and what survives with a
concrete functional reason. Status values are COMPLETE / IN PROGRESS /
NOT STARTED / RETAINED.

Baseline for every "removed" claim: commit `643cfad`. Nothing is unrecoverable.

---

## 1. Retired presentation

| Old | Why it conflicts | Replacement | Status |
|---|---|---|---|
| `fluidSimGL.ts`, `fluidFieldGL.ts`, `fluidPhysics.ts` fragment body | Mandate retires fluid/blob backgrounds and forbids competing effects alongside the sphere | `HeroScene` point cloud | REMOVED FROM PRODUCTION — but **not** dead code: `FluidFieldDemo.tsx` on the internal `/motion-lab` surface still imports `fluidSimGL.ts` via `FluidFieldRawGL`. No public marketing route reaches it. Verified by grep, not assumed. |
| `MarketingFluidField.tsx` | Mounted the fluid field into every marketing route | Unmounted from `(marketing)/layout.tsx` | COMPLETE — no importer remains |
| `FluidFieldRawGL.tsx` | Drove the simulation | — | KEPT — `/motion-lab` is its only remaining consumer |
| `Hero.tsx` composition | Centred headline over a fluid mass; mandate specifies left copy + right sphere anchor | Rebuilt `Hero.tsx` | COMPLETE |
| `HeroOrbitalSystem.tsx`, `WarpField.tsx`, `RotatingLine.tsx` | Decorative effects competing with the sphere | None | NOT DONE — still imported by unmigrated routes; must not be removed before those are migrated |
| `Navigation.tsx` logo placement | Left-aligned; mandate requires a centred collapsing capsule | `LogoLockup` | COMPLETE |
| `CentralInsight.tsx` | Not the five-line manifesto | `Manifesto.tsx` | COMPLETE — dead code |
| `ModusProcessSection.tsx`, `BusinessXRaySection.tsx` (homepage) | Flat sections where a real 3D sticky stack is required | `StackSection.tsx` | COMPLETE on the homepage; both files still imported by other routes |
| Token *values* in `globals.css` | Cool near-white/near-black palette; target is warm ground `#D7D7D0` + ink + cream | New values, same architecture | COMPLETE |
| `tailwind.config.ts` type scale | Sans-only, no serif display role | Serif display + Geist-style sans + mono | COMPLETE |
| `Loader.tsx` (first-load intro curtain) | Removed at the user's request — a dark full-viewport panel that split open like doors over the already-rendered page on every full load. Presentational only, never tied to real load state. | None; the page paints straight to the hero | COMPLETE — unmounted from `(marketing)/layout.tsx`, file kept on disk, no importer remains. `e2e/loader.spec.ts` inverted into a guard that nothing covers the page on load. |
| `Container.tsx` widths | 1760px / 24–48px gutters | 1512px / 120px desktop, 24px mobile | COMPLETE |

**Deletion policy.** Files are unmounted and left on disk rather than deleted,
per the user's choice. `MODUS_REBUILD_PLAN.md` records why. A file that is
dead code is listed here; a file that still has a live importer is not
claimed as removed.

---

## 2. Retained, with reason

| Kept | Reason |
|---|---|
| `LenisProvider.tsx` | Already the exact single-instance, ticker-driven, `lagSmoothing(0)` integration the mandate specifies. Rebuilding it would be churn. |
| `src/lib/motion/gsap.ts` | Already the single registration module. `SplitText` is added to it, not to a second module. |
| CSS-custom-property token *architecture* | RGB-channel format is what keeps Tailwind opacity modifiers working. Values change; the mechanism is correct. |
| `DiagnosticCTA.tsx` | Carries the personalised next-best-action logic and analytics. Restyled in place; logic untouched. |
| Diagnostic state machine, validation, resume, submission, retry | Functional contract — explicitly preserved. |
| i18n, theme, consent, analytics, auth, `/app`, `/private` | Functional contract. |
| `LogoMark` SVG geometry | Already the supplied four-bar + centre-square mark. Extended, not replaced. |

---

## 3. Residual legacy influence to re-check at Checkpoint H

- Hardcoded hex outside the token system (`Logo.tsx` tones,
  `globals.css` `.reg-mark`, `--fluid-*`).
- The "always-dark" components flagged in the earlier report
  (`Philosophy`, `ClientAuthOverlay`, `PlatformPanels`) that may still carry
  the `bg-ink text-paper` inversion bug.
- `grain-overlay` — decorative, may or may not suit the warm ground.
- Stale `@react-three` directory in `node_modules`.
- `motion/react` usage in `Navigation` and elsewhere, now sitting alongside
  GSAP. Not a conflict, but two animation systems in one shell is worth a
  deliberate decision rather than drift.

---

## 4. Verification method for "no competing old design remains"

At Checkpoint H, grep the migrated routes for: old palette hex, `display-xl`
usages that should now be serif, hero/blob class names, duplicate Lenis
construction, and `fluid` imports. Every surviving match is either explained
here or fixed. A grep that returns nothing is recorded as such; a grep that
returns matches is not described as clean.
