# MODUS Visual Reset Audit

What the old presentation was, what replaces it, and what survives with a
concrete functional reason. Status values are COMPLETE / IN PROGRESS /
NOT STARTED / RETAINED.

Baseline for every "removed" claim: commit `643cfad`. Nothing is unrecoverable.

---

## 1. Retired presentation

| Old | Why it conflicts | Replacement | Status |
|---|---|---|---|
| `fluidSimGL.ts`, `fluidFieldGL.ts`, `fluidPhysics.ts` fragment body | Mandate retires fluid/blob backgrounds and forbids competing effects alongside the sphere | `HeroScene` point cloud | NOT STARTED |
| `FluidFieldRawGL.tsx`, `MarketingFluidField.tsx` | Mount the above into every marketing route | Unmounted from `(marketing)/layout.tsx` | NOT STARTED |
| `Hero.tsx` composition | Centred headline over a fluid mass; mandate specifies left copy + right sphere anchor | Rebuilt `Hero.tsx` | NOT STARTED |
| `HeroOrbitalSystem.tsx`, `WarpField.tsx`, `RotatingLine.tsx` | Decorative effects competing with the sphere | None | NOT STARTED |
| `Navigation.tsx` logo placement | Left-aligned; mandate requires a centred collapsing capsule | `LogoLockup` | NOT STARTED |
| `CentralInsight.tsx` | Not the five-line manifesto | `Manifesto.tsx` | NOT STARTED |
| `ModusProcessSection.tsx`, `BusinessXRaySection.tsx` (homepage) | Flat sections where a real 3D sticky stack is required | `StackSection.tsx` | NOT STARTED |
| Token *values* in `globals.css` | Cool near-white/near-black palette; target is warm ground `#D7D7D0` + ink + cream | New values, same architecture | NOT STARTED |
| `tailwind.config.ts` type scale | Sans-only, no serif display role | Serif display + Geist-style sans + mono | NOT STARTED |
| `Container.tsx` widths | 1760px / 24–48px gutters | 1512px / 120px desktop, 24px mobile | NOT STARTED |

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
