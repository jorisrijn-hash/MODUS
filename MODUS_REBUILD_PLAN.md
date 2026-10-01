# MODUS Rebuild Plan — Antimetal visual and motion language

Execution record for `MODUS-CLAUDE-CODE-MASTER-PROMPT.md`. Written before any
presentation was edited. Companion documents: `MODUS_BUILD_CHECKLIST.md`
(section 11 checklist), `MODUS_VISUAL_RESET_AUDIT.md` (what is retired and
what replaces it), `MODUS_VALIDATION_REPORT.md` (evidence).

This plan supersedes the Master Redesign V2 direction recorded in
`MODUS_REDESIGN_PLAN.md` for everything visual. That earlier document is kept
for its functional and architectural findings, which remain accurate.

---

## 1. Baseline and reversibility

**Finding, recorded before editing:** MODUS had no version control of its own.
`git rev-parse --show-toplevel` resolved to `/Users/joris` — a repository
rooted at the home directory, containing unrelated client work
(`clients/phonerepairhouse`), in which `dev/modus/` was entirely untracked
(`?? ./`). A visual reset of this size had no revert path.

Resolved with the user's explicit approval:

1. Filesystem snapshot taken first (297 files) outside the project tree.
2. `git init` in `/Users/joris/dev/modus`, baseline commit `643cfad`
   ("Baseline before Antimetal visual rebuild"), 289 files tracked.
3. Secret check performed before committing: `.env` and `prisma/*.db` are
   excluded by the pre-existing `.gitignore`; only `.env.example` (a
   template) is tracked. Verified against the index, not assumed.

Every change from here is an ordinary reversible edit against that commit. No
destructive git operation is used at any point.

---

## 2. Reference authority as applied here

Priority order is the master mandate's. Two consequences worth stating plainly
because they override earlier in-flight work:

- **The fluid/blob hero is retired.** The mandate lists "fluid/blob
  backgrounds and decorative effects" as replaceable presentation and
  specifies the point-cloud sphere instead, with "do not add competing
  effects." This discards `fluidSimGL.ts` — a true Stable-Fluids simulation
  built in the previous session and still awaiting review as Checkpoint 5.5A.
  The user confirmed this explicitly. Files stay on disk as dead code so
  nothing is unrecoverable; see the visual-reset audit.
- **Hero copy changes.** The mandate (section 5) specifies
  `Find the friction. / Move forward.`, which also matches `modusreff.png`.
  The existing approved headline ("We improve how businesses work.") is
  priority 5, below the mandate. The new copy is added through the existing
  i18n dictionaries in both EN and NL — the translation system is preserved,
  not bypassed.

### Evidence actually inspected

All four supplied assets and all five Antimetal captures were opened and
viewed, not inferred from filenames:

| File | What it actually shows | How it is used |
|---|---|---|
| `assets/modus-logo-source.png` | Deep green rounded tile, four detached white bars around a white centre square | Authoritative mark geometry and `#1E3B2E` |
| `assets/stack-corner-reference.png` | Unfilled card: faint dashed border + four solid L brackets; filled card: solid dark, no brackets | `BracketFrame` / `StoryCard` contract |
| `assets/modusreff.png` | MODUS homepage study — placeholder text logo, static sphere keyframe, flat stack | Content order and broad alignment only |
| `assets/foundationsandcomponents.png` | Antimetal foundations study, fallback sans rendering, gold `#D5A45B` accent | Palette/scale direction; gold and copy **not** adopted |
| `hero-live.jpg` / `hero-network.jpg` | Ordered radial-spoke sphere / clustered network with sparse edges | Hero cycle endpoints |
| `stack-start/middle/end.jpg` | Team+Production only → tilted with visible side edges → flat full diagram | Stack timeline endpoints and the depth proof |

**Paper was not inspected.** No Paper MCP connection is available in this
session. Paper page content is therefore used only as it is described and
screenshotted in the pack. No claim of a fresh Paper inspection is made
anywhere in these documents.

---

## 3. Current state — what exists

Next.js 16.3.3 (App Router, Turbopack), React 19.2.8, TypeScript, Tailwind
3.4.17, Prisma/SQLite.

**Real entry routes and their shell.** `src/app/(marketing)/page.tsx` is the
live homepage. Its shell is `(marketing)/layout.tsx`:
`LenisProvider → Loader → MarketingFluidField → Navigation → PageTransition →
children → Chatbot → LanguagePrompt`. Root `layout.tsx` owns
`ThemeProvider → LocaleProvider → OverlayProvider → MotionProvider` and the
globally-correct `ConsentBanner`.

**Infrastructure that is already correct and will be reused, not rebuilt:**

- **Lenis** — one instance, `autoRaf: false`, driven from `gsap.ticker` with
  `lenis.raf(time * 1000)`, `ScrollTrigger.update` wired to its scroll event,
  `lagSmoothing(0)` applied once. This is already exactly the integration the
  mandate's section 6G asks for. Reduced motion never constructs Lenis at all.
- **GSAP 3.15** with a single registration module (`src/lib/motion/gsap.ts`).
  `SplitText.js` ships in this version, so the masked reveal needs no new
  dependency and no CDN script.
- **Token architecture** — `globals.css` defines semantic custom properties as
  space-separated RGB channels; `tailwind.config.ts` consumes them as
  `rgb(var(--x) / <alpha-value>)` so opacity modifiers keep working. Light,
  OS-dark and explicit-dark are resolved in pure CSS with no flash. The
  *structure* is sound and is kept; the *values* are replaced.
- **i18n** (EN/NL cookie-based), **theme** (cookie-based), cookie consent,
  analytics `track()`, customer-context next-best-action, the six-step
  diagnostic state machine, `/app` and `/private` auth boundaries.

**Genuinely missing, now installed:** `three` — no 3D renderer was present
(R3F was removed in an earlier checkpoint; a stale empty `@react-three`
directory remains in `node_modules`). Raw Three.js is used, not R3F, per the
mandate's preference.

**Missing, to be added:** a serif display face. No Signifier licence is
supplied anywhere in the repo, so the mandate's explicit fallback —
Noto Serif — is used via `next/font/google`. This is a fallback, labelled as
one, not a claim of Signifier.

---

## 4. Old → new component map

| Current | Disposition | Replacement |
|---|---|---|
| `Hero.tsx` (fluid field + floating diagnostic shell) | Replaced | `Hero.tsx` rebuilt: eyebrow, `Find the friction. / Move forward.`, lead, Free Diagnostic CTA, right-side `HeroScene` |
| `FluidFieldRawGL.tsx`, `MarketingFluidField.tsx`, `fluidSimGL.ts`, `fluidFieldGL.ts` | Retired from production | Removed from the marketing shell; files kept on disk as dead code |
| `HeroOrbitalSystem.tsx`, `WarpField.tsx`, `RotatingLine.tsx` | Retired if unreferenced | Superseded by `HeroScene` |
| `Navigation.tsx` (left logo / centre links / right actions) | Replaced | Left info links, **centred** collapsing `LogoLockup` capsule, right actions |
| `CentralInsight.tsx` | Replaced | `Manifesto.tsx` — five centred serif lines, supplied verbatim |
| `ModusProcessSection.tsx`, `BusinessXRaySection.tsx` | Replaced on the homepage | `StackSection.tsx` — three 100vh story steps + sticky real 3D scene |
| `CapabilitiesPreview.tsx` | Replaced | Ruled capability rows |
| `WhatModusSees.tsx`, `CasesPreview.tsx`, `PlatformTeaser.tsx`, `PricingPreview.tsx` | Restyled | Kept content, new presentation |
| `FinalCTA.tsx`, `Footer.tsx` | Restyled | Same real routes, new language |
| `Logo.tsx` | Extended | Geometry already matches the supplied mark; a tiled green variant is added |
| `Container.tsx` | Replaced values | 1512px container, 120/24px gutters |
| `DiagnosticCTA.tsx` | Kept, restyled | Personalisation logic untouched; gains character-stagger motion |

**Logo finding:** `LogoMark` already draws four detached orthogonal bars
around a centre square — the supplied geometry, not an invented M. Only the
colour treatment and the green rounded tile need adding. No symbol is
invented and no reconstruction is passed off as the original vector.

---

## 5. New modules

```
src/lib/design/scaling.ts        Osmo scale factor, deliberate units
src/components/ui/BracketFrame.tsx   dashed frame + four solid L corners
src/components/ui/LogoLockup.tsx     centred collapsing capsule
src/components/ui/AnimatedButton.tsx character-stagger CTA wrapper
src/components/ui/MaskedHeading.tsx  data-split heading contract
src/lib/motion/splitReveal.ts        SplitText + ScrollTrigger init
src/components/hero/HeroScene.tsx    canvas host, visibility, fallback
src/lib/three/pointCloud.ts          geometry, clusters, Fibonacci, cycle
src/components/hero/SignalLabels.tsx projected DOM label overlay
src/components/stack/StackSection.tsx  story column + sticky scene
src/components/stack/StoryCard.tsx
src/lib/three/stackGeometry.ts       reference rects → world coords
src/lib/three/stackScene.ts          boxes, occlusion plane, camera fit
src/lib/three/stackTimeline.ts       the single 2.7-unit timeline
src/lib/three/visibility.ts          IntersectionObserver + document.hidden
```

---

## 6. Implementation order

| CP | Work | Exit evidence |
|---|---|---|
| A | Audit, baseline, these four documents | Done — this file |
| B | Tokens, Osmo scaling, type, `BracketFrame`, nav/footer/primitives | Real routes render the new shell; old cascade gone |
| C | Static complete homepage + responsive | 1440/390 screenshots, honest draft-content gaps |
| D | Hero point cloud | 13s cycle, drag, labels, fallbacks |
| E | Real 3D stack | Forward/reverse states with visible side edges and depth |
| F | Lenis sync, logo collapse, SplitText, button stagger | One loop, correct thresholds, cleanup |
| G | Remaining routes, themes, locales | Functional regression across real routes |
| H | Comparison, performance, accessibility | Evidence report with remaining differences |

---

## 7. Known gaps and risks, recorded up front

1. **Paper not inspected** — no MCP connection. Measurements come from the
   pack's embedded research, not a live design read.
2. **No Signifier licence** — Noto Serif fallback, labelled.
3. **Five business categories, not nine integration logos.** The tool row is
   recomputed deliberately: `(1272 − 4×20) / 5 = 238.4` wide, `x = 120 +
   i×258.4`. No Antimetal provider logo is used or implied as a MODUS
   integration.
4. **Osmo scaling at 992px** yields an ~11.02px base unit. Typography will be
   clamped for readability and the deviation documented rather than applied
   mechanically.
5. **Scope of consistency.** The homepage is the priority. Applying the new
   system across `/app` and `/private` shells is real work that may land
   partially; it will be reported as INCOMPLETE rather than claimed.
6. **Draft content.** The 62/100 friction score, the row icons and the
   capability descriptions in the studies are drafts. Anything illustrative
   is labelled as such; no verified outcome is implied.
