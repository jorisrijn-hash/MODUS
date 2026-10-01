# MODUS Master Redesign V2 — Report

Updated after every checkpoint, per the brief. New entries append above
older ones (most recent first). Checkpoint 5.5 onward follows the
requester's own "reporting standard" (verification document, not a
progress summary) — evidence and comparison tables over adjectives.

---

## Checkpoint 5.5A — True Fluid Simulation + Reference-Parity Hero (2026-10-01)

### 1. Status

**HERO: NEEDS REVIEW** (not self-marked PASS). Every item on the
supplied pass-condition list is now implemented and evidenced below, but
two measurable deviations from the reference remain (Section 19), and
the pass/fail call is the reviewer's, not mine. The rest of the homepage
is still untouched.

### 2. Objective

Replace the procedural multi-blob approximation with a real
incompressible-fluid simulation, and rebuild the hero to the supplied
reference's actual composition and contrast system (off-white page,
near-black organic mass upper-right, green atmosphere through the lower
half, centred editorial headline, large bright floating diagnostic
shell) — translating blue→green and AI-prompt→Free-Diagnostic only.

### 3. Reference target

`rbp-ai-saas-template.vercel.app` plus the supplied green-graded hero
mockup (image 20), treated as the current hero target.
`reactbits.dev/animations/splash-cursor` as the fluid behavioural
reference.

### 4. Algorithm — what was actually implemented

New file: `src/lib/webgl/fluidSimGL.ts` (25,678 bytes source). Jos
Stam's **Stable Fluids** semi-Lagrangian method — the standard GPU
formulation that PavelDoGreat's WebGL-Fluid-Simulation (which Splash
Cursor wraps) also uses. Implemented from the published algorithm into
this project's existing raw WebGL2 setup; no R3F/Three added, nothing
ported line-for-line.

Per-frame pass order:

1. **curl** — vorticity of the velocity field → `curl` texture
2. **vorticity confinement** — curl-derived force added back to velocity
3. **divergence** — ∇·velocity → `divergence` texture
4. **pressure decay** — previous frame's pressure × `pressure` constant
5. **pressure solve** — 20 Jacobi iterations of the Poisson equation
6. **gradient subtraction** — velocity −= ∇pressure (makes it
   divergence-free / incompressible)
7. **advect velocity** — semi-Lagrangian, by itself
8. **advect dye** — semi-Lagrangian, by the velocity field
9. **splats** — pointer-driven + seeded/ambient injection
10. **display** — dye density → MODUS palette ramp → screen

Resources: 9 shader programs, ping-pong FBO pairs for velocity
(`RG16F`), dye (`RGBA16F`) and pressure (`R16F`), plus single FBOs for
divergence and curl. Requires `EXT_color_buffer_float`; if absent, the
field reports unsupported and renders nothing rather than something
subtly wrong.

### 5. Tuning values (and the MODUS-specific deviations from stock)

| Parameter | Value | Note vs. a stock "splash cursor" |
|---|---|---|
| simResolution | 128 (64 on <900px) | — |
| dyeResolution | 512 (256 on <900px) | — |
| densityDissipation | **0.34** | far lower than stock; pigment persists |
| velocityDissipation | 0.7 | lower; momentum carries, settles slowly |
| pressure | 0.8 | — |
| pressureIterations | 20 (12 on <900px) | — |
| curl | **14** | moderate; organic folding without turbulence |
| splatRadius | **0.42** | much larger — broad displacement, not a jet |
| splatForce | **2200** | weaker than stock's dramatic value |
| dye per splat | [0.5, 1.25, 0.95] | injected >1.0 so mass reaches the core ramp |

MODUS-specific algorithm additions, not in the stock implementation:
- **`seedInitialState()`** — 8 large low-velocity splats fired on first
  frame, composing the resting field before any interaction.
- **`replenishRestingMass()`** — the seed composition re-injected at 30%
  strength every 1.6s, so dissipation high enough to clear transient
  pointer pigment doesn't also erase the composed mass.
- **No hue cycling at all.** Dye carries *density*; the display pass
  maps density onto a fixed MODUS palette.

### 6. Colour system translation (explicit, as required)

The rule applied: *preserve the reference's contrast system; swap only
the hue family.* The luminance relationship therefore inverts between
themes, as the reference's own light/dark heroes do.

| Role | Reference | MODUS |
|---|---|---|
| Light-mode page ground | off-white | unchanged — `paper`, off-white |
| Light-mode mass core | near-black blob | `[0.03, 0.09, 0.07]` near-black with green in it |
| Light-mode mass body | blue pigment | `[0.07, 0.26, 0.19]` deep MODUS green |
| Light-mode outer atmosphere | pale blue fading to white | `[0.80, 0.87, 0.83]` pale green just above the page |
| Light-mode typography | black on off-white | unchanged — `ink` on `paper` |
| Dark-mode page ground | near-black | unchanged — `paper` resolves near-black |
| Dark-mode mass body | luminous blue | `[0.20, 0.62, 0.45]` luminous MODUS green |
| Dark-mode highlight | pale core | `[0.55, 0.82, 0.70]` restrained mineral green, held to d>0.72 |
| Dark-mode outer atmosphere | deep blue-black | `[0.05, 0.13, 0.10]` deep green-black |
| Dark-mode typography | off-white on near-black | unchanged |
| Floating shell | bright white in both themes | forced `bg-white/95` + `neutral-900` text in both themes |

The specific failure mode called out ("dark green haze / green-tinted
black page") is avoided by keeping each ramp's `glow` end close to the
page background, so green appears *inside* the mass rather than tinting
the field.

### 7. Hero geometry — measured, not described

Measured via `getBoundingClientRect()` at 1440×900, as % of viewport:

| Element | X | Y | W | H |
|---|---|---|---|---|
| Nav | 0% | 0% | 100% | 9% |
| Headline | 24.6% | 17.8% | **50.8%** | 20.3% |
| Diagnostic shell | 24.4% | 44.3% | **51.1%** | 16.2% |
| Support copy | 3.3% | 78.3% | 22.2% | 14.6% |

Headline and shell are both centred (24.6 + 50.8/2 ≈ 50%). Shell width
is 51.1%, against the brief's "~40–50%" target — marginally over, and
flagged rather than quietly left. Previous pass for comparison: shell
was 576px ≈ 40% width, pinned to the left gutter at x≈3%.

### 8. Blur / silhouette comparison (required test, performed)

Both the reference mockup and the MODUS hero were downsampled to 110×70
and Gaussian-blurred, then inspected side by side.

**Matching masses:** off-white ground; centred two-line dark text mass
upper-centre; large bright horizontal floating object below it with a
small dark circular action at its right end; dark organic mass
upper-right; small quiet copy block low-left.

**Mismatch found and fixed during this pass:** the first silhouette
comparison showed MODUS's green confined to the right edge while the
reference carries a broad green atmosphere across the entire lower half.
Three wide, low-velocity splats were added along the bottom of the seed
composition (`SEEDS` entries at y≈0.02–0.08). Re-captured and
re-blurred: the lower-half green spread is now present.

**Remaining silhouette differences:** MODUS's dark mass is larger and
spreads further down the right edge than the reference's compact blob;
MODUS's headline mass is wider.

### 9. Fluid QA — the 8 required captures

All captured at 1440×900, both themes, zero console errors in either.

1. **At rest, no pointer interaction** — a composed dark mass sits hard
   right, bleeding off-canvas, with green atmosphere through the lower
   half. This is the key requirement and it holds: the field is fully
   formed before any input.
2. **Slow pointer movement** — broad local displacement; material pushes
   aside rather than a line being drawn.
3. **Fast pointer movement** — large-scale advection, visible directional
   momentum, folding and swirls through the viewport.
4. **Immediately after movement stops** — motion continues briefly.
5. **1s later** — still redistributing, visibly slowing.
6. **4s later** — returned to a right-weighted composition; transient
   pigment has cleared.
7. **Dark mode** — luminous green mass, restrained mineral highlight.
8. **Light mode** — near-black mass, green body, pale green atmosphere.

### 10. Failed tuning attempts (recorded, as required)

- **densityDissipation 0.4** → seeded mass faded to ~30% within 3s;
  wispy, no real mass at rest. Rejected.
- **densityDissipation 0.12** → mass held, but nothing ever cleared;
  after sustained pointer movement dye accumulated until it flooded the
  viewport and did not settle (captured and inspected). Rejected.
- **0.34 + `replenishRestingMass()`** → both requirements satisfied.
  Adopted.
- **curl 22** → visibly sooty, fractal edges. Pulled back to 14.
- **Dark-mode core `[0.78,0.94,0.86]` with core threshold 0.45** → pale
  mint spread across too much of the mass, reading white rather than as
  a highlight. Core pulled to `[0.55,0.82,0.70]` and the threshold
  raised to 0.72.
- **Seeds at x≈0.58–0.82** → mass swallowed the end of the centred
  headline's first line. Moved to x≈0.84–1.02.
- **Keeping the old CSS radial mask + `opacity-[0.46]` wrapper** → a deep
  green at 46% over off-white renders as grey; the first capture of the
  real sim looked grey, not green. Both removed; intensity now lives
  only in the palette.

### 11. Performance

- **Homepage first-load JS: 1,528,434 → 1,528,637 bytes (+203).** The
  simulation is lazily loaded (`next/dynamic`, `ssr:false`), so it sits
  in a separate chunk rather than first-load.
- Source size: 25,678 bytes (`fluidSimGL.ts`), pre-minification.
- **Canvas count: 1.** **RAF loops: 1.**
- Observed **53.6 rAF frames/sec** during active simulation in headless
  Chromium at 1440×900 (headless typically under-reports vs. real
  hardware; not a device benchmark).
- DPR capped at 2 desktop / 1.5 narrow.
- Mobile/narrow (<900px): simResolution 128→64, dye 512→256, pressure
  iterations 20→12.
- Touch/coarse pointer: not mounted at all. Reduced motion: not mounted.
- `visibilitychange`: stops the RAF loop when hidden.
- `dispose()` deletes all 9 programs, all 8 textures and all 8
  framebuffers, removes listeners, cancels RAF.

### 12. Components changed

- **New**: `src/lib/webgl/fluidSimGL.ts`.
- **Rewritten**: `FluidFieldRawGL.tsx` (now drives `FluidSimGL`, holds
  the two palettes), `Hero.tsx` (centred composition), `MarketingFluidField.tsx`
  (mask/opacity crutch removed).
- **Extended**: `DiagnosticCTA.tsx` — new `hero-round` variant + `icon`
  prop; when an icon is supplied the personalised label becomes the
  `aria-label`, so the accessible name is unchanged.
- **Now unused in production**: `fluidFieldGL.ts` and
  `fluidPhysics.ts`'s `FLUID_FRAGMENT_BODY` (the procedural
  approximation). Per the "do not maintain both" instruction nothing
  imports them any more. `FluidFieldPhysics` (the small pointer-lag
  class in the same file) is still used by `imageBulgeGL.ts`, a
  different effect, so that file stays.
- **Updated**: `motion-lab/FluidFieldDemo.tsx` — the old per-element
  hover states (idle/hover-cta/hover-text/hover-media) were removed
  rather than faked; they scaled one blob's radius in the old shader and
  have no equivalent in a real velocity/dye simulation.

### 13. Functional regression

tsc clean, eslint clean, production build clean, vitest 22/22,
Playwright **41/43** (1 pre-existing intentional skip, 1 pre-existing
`AnimatePresence` flake unrelated to this work — same test, same
signature as every run this session). Specifically confirmed:
Free Diagnostic CTA, `/diagnostic` happy path + optional-field path,
homepage→`/diagnostic?hint=` (the relocated shell's contract), sign-in,
EN/NL, theme, cookies, navigation, mobile navigation, `/app` and
`/private` isolation, and the "diagnostic route does not mount the
WebGL fluid field; homepage does" assertion — which still passes,
confirming the new simulation respects the same route gating.

### 14. Known differences from reference

1. MODUS's dark mass is larger and spreads further down the right edge
   than the reference's more compact, discrete blob.
2. Diagnostic shell is 51.1% viewport width vs. the stated 40–50% target.
3. The shell sits in normal flow below the headline; the reference's
   overlaps its field more directly.
4. Scroll cue sits at the hero's bottom-right; at 900px viewport height
   it lands very near the fold.
5. No dark→light environmental scroll transition, no scroll-driven
   blur/focus text reveal — both still open from earlier passes.
6. Mobile keeps the same composition at reduced simulation cost, but has
   not had a dedicated recomposition pass.

### 15. Decisions made

1. Implemented Stable Fluids rather than continuing to approximate.
2. Removed the procedural system from production rather than keeping both.
3. Inverted the palette's luminance relationship between themes to
   preserve the reference's contrast system in both.
4. Added `replenishRestingMass()` as the resolution of the
   mass-at-rest vs. accumulation conflict.
5. Removed motion-lab's hover-state demo hooks rather than faking
   equivalents against the new simulation.

### 16. Decisions requiring approval

1. **Hero pass/fail** — the call is yours; Section 14 lists what still
   differs.
2. **Shell width** 51.1% vs. the 40–50% target — tighten or accept.
3. **Mass scale** — reduce the seeded form so it reads as a more compact
   blob closer to the reference, or keep the broader spread.
4. **Deleting `fluidFieldGL.ts`** now that production no longer uses it.
5. Earlier open items (HeroOrbitalSystem's destination, `RotatingLine`,
   `DiagnosticEntry.tsx`'s fate, dedicated mobile recomposition).

### 17. Blockers

None.

### 18. Recommended next step

Review the hero at full resolution. If it passes, 5.5B (remainder of the
homepage) follows; if not, Sections 14/16 are the concrete list to work
from.

---

## Checkpoint 5.5, second pass — Structural Hero Rebuild + Fluid Field Overhaul (2026-10-01)

### 1. Status

**INCOMPLETE — VISUAL TARGET NOT MET, for the homepage as a whole.**
Hero + fluid field are substantially closer to the reference composition
than the first pass (silhouette/mass test below), but this is still only
the hero — nothing below it has been touched, so the homepage overall
still doesn't clear the requester's own completion bar.

### 2. Objective

The first Checkpoint 5.5 pass (fewer elements, bigger headline, one CTA
pair, a stronger fluid field) was judged still fundamentally the old
hero formula with less in it — "left-aligned business hero + empty right
side + subtle ambient blob." This pass changes the actual composition,
not its element count: headline placement/line-break behavior, the
field's own visual mass and silhouette, and replacing the conventional
CTA row with a floating interactive object, per the requester's explicit
structural correction and the follow-up fluid-physics direction
referencing React Bits' "Splash Cursor."

### 3. Reference target

Same `rbp-ai-saas-template.vercel.app` screenshots as the first pass,
now read for spatial structure specifically (headline position/width/
line-count, field coverage/silhouette, floating-object placement,
copy position, negative space) rather than general mood. Additionally:
`reactbits.dev/animations/splash-cursor`, read as a technical/behavioral
reference for fluid physics (not implemented as a port — see Section 17).

### 4. Before (this pass's starting point — i.e., the first pass's result)

Hero: single column, `max-w-3xl`, left-anchored. Headline rendered via
unconstrained `text-balance` at `display-xl` inside a ~672px column,
which wrapped "We improve how businesses work." across **four**
single/double-word lines ("We improve" / "how" / "businesses" /
"work."), not the two compact lines the copy reads as naturally. A small
mono process label sat above the headline. Below the headline: one short
body line, then a conventional two-element CTA row (primary button +
secondary text link). Fluid field: a single radial mass, soft
circular-gradient falloff, no defined edge — in the first pass's own
screenshot, a viewer could mentally remove the green area and the page
composition would read almost the same; the field was not yet a
structural part of the layout.

### 5. After

Hero: headline manually split into exactly two lines ("We improve how" /
"businesses work.") in a widened `max-w-4xl` column, `display-xl`'s
clamp ceiling brought back down from 7.25rem to 6.25rem (a deliberate
"match width/line-break behavior, don't just maximize size" correction —
the first pass had raised it, this pass partly reversed that once the
real constraint turned out to be width/wrapping, not raw size). The mono
process label is gone from the hero. Immediately below the headline: a
large floating diagnostic-entry shell — input + 5 category chips +
submit button, relocated here from the standalone `DiagnosticEntry`
section (removed from `page.tsx`, not duplicated) — styled with a
forced-light surface (`bg-white/95`, fixed `neutral-900` text) in both
themes, so it reads as a bright floating object against the field in
dark mode rather than blending into it as a theme-relative `bg-paper`
card would have. Supporting copy moved to the bottom of the hero (`mt-auto`
flex push), small, spatially separated from the headline, alongside a
restrained scroll-cue indicator. Fluid field: rebuilt from one soft
radial blob into three independently-positioned, independently-drifting
"organic masses" (each itself a sum of three offset sub-circles, so the
silhouette is lumpy/cloud-like rather than a perfect disc), a sharpened
per-mass edge (tighter `smoothstep` band) and a power-curve contrast
boost (`pow(field, 0.55)`) so the mass has a visible boundary instead of
a long even fade, plus a third `highlight` color layered in near the
pointer and the dominant mass for dimensionality. The field's own CSS
mask was widened (the first pass's tighter ellipse was clipping the new
mid-viewport mass) and wrapper opacity raised again (40%→46%).

### 6. Reference vs MODUS comparison

| Reference characteristic | MODUS implementation | Remaining difference |
|---|---|---|
| Headline: compact 2 lines, width-matched to the statement | Headline: exactly 2 lines, manually split, column widened to fit | Reference's headline sits closer to the canvas's horizontal center; MODUS's is still left-aligned (a deliberate MODUS-restraint choice, not yet revisited) |
| Fluid visual as ~40–60% of the composition with a visible silhouette | Field now spans roughly the right half of the viewport with a lumpy, edge-defined silhouette (blur test below) | Reference's mass reads as a true liquid material with velocity-reactive stretch/trail; MODUS's is a procedural multi-blob approximation — more defined than the first pass, still not a real fluid sim (Section 17) |
| A large floating interactive object crossing/sitting on the field | Diagnostic entry shell now floats directly below the headline, forced-light surface, visibly distinct from the field behind it | Reference's object visually overlaps/crosses the field more; MODUS's sits just below it in normal flow rather than absolutely positioned across it |
| Tiny supporting copy, spatially separate, near the bottom | Supporting copy moved to the bottom of the hero via flex push, smaller type | Matches reasonably closely |
| Minimal nav, almost disappearing against the hero | Nav unchanged from the first pass (4 links + icon + CTA) | Not revisited this pass |

### 7. Components removed / relocated / retained

**REMOVED FROM THE HERO (first-pass items, confirmed still out):**
`SectionLabel`/mono process label, the two-button CTA row,
`HeroOrbitalSystem`. No change from the first pass's disposition.

**RELOCATED THIS PASS:**
- `DiagnosticEntry`'s interaction (input, 5 category chips, submit) —
  moved from its own standalone homepage section into the hero. The
  `DiagnosticEntry.tsx` file itself is unchanged and still exists but is
  no longer imported by `page.tsx`; the hero now has its own inline copy
  of the same interaction pattern (same dict keys, same safety boundary:
  routes to `/diagnostic`, never writes to the real diagnostic
  `sessionStorage` key, hint passed only as a `?hint=` query param).
  **Decision flagged below**: this duplicates the interaction's logic in
  two files rather than extracting a shared component — deliberate for
  now, given the hero's version needs different (forced-light) styling
  the section version shouldn't necessarily inherit, but worth
  reconsidering once the section-level version's own fate is decided
  (Section 15).

**STYLING CHANGED, NOT STRUCTURE:**
- `display-xl` token: ceiling lowered 7.25rem → 6.25rem (still only
  consumed by `Hero.tsx`).

### 8. Typography

- `display-xl` clamp: `6rem` (original) → `7.25rem` (first pass) →
  `6.25rem` (this pass) — net +4.2% over the original, down from the
  first pass's +21%. The correction: the first pass tried to solve
  "headline too small" with more font-size; the actual problem was
  line-wrapping/width, which this pass fixes directly (manual 2-line
  split + wider column), letting the size pull back toward something
  that actually fits the target line-length instead of forcing the
  browser to wrap mid-phrase.
- Headline now renders as a fixed 2-line structure
  (`<span className="block">`) rather than letting `text-balance` choose
  wrap points — verified via screenshot at 1440px: exactly "We improve
  how" / "businesses work.", no orphaned single words.

### 9. Spacing / layout

- Headline container: `max-w-2xl` (672px) → `max-w-4xl` (896px).
- Diagnostic shell: `max-w-xl` (576px), positioned directly under the
  headline (not centered in the viewport, not absolutely positioned
  over the field — normal document flow, `mt-10`).
- Supporting copy + scroll cue: moved from immediately under the
  headline to a `mt-auto`-pushed row at the bottom of the hero's flex
  column, `max-w-[22rem]` for the copy specifically (down from the
  un-constrained-width paragraph the first pass had).
- Verified the hero section's rendered height exactly equals the
  viewport height at 1440×900 (`900px === 900px`, measured via
  `getBoundingClientRect()`), confirming the new taller stack (headline
  + floating shell + bottom row) doesn't silently overflow `min-h-[100svh]`.

### 10. Color / theme

- Diagnostic shell: changed from theme-relative (`bg-paper`, which
  resolves dark in dark mode) to a forced-light surface
  (`bg-white/95`/`text-neutral-900`/`border-black/10`) in **both**
  themes — a deliberate, theme-independent exception, reasoned from the
  reference's own prompt box staying bright/white-ish regardless of its
  page's light/dark state. Documented inline in `Hero.tsx` as an
  intentional parallel to the footer's existing fixed `inverted` tokens,
  just in the opposite direction (always-light here, always-dark there).
- Fluid field: added a third `uColorHighlight` uniform per theme — light
  mode's stays within the green family (a more saturated edge, not a
  pale wash, per the brief's explicit "dense pigment" instruction for
  light mode); dark mode's is a genuinely pale/luminous mint, used at
  low mix-weight so it reads as a highlight, not a wash.

### 11. Motion

**Fluid field shader (`fluidPhysics.ts`)**
- System: still raw WebGL2, single fragment-shader pass — no multi-pass
  render-to-texture added (Section 17 explains why).
- New: `uTime` uniform (elapsed seconds since the `FluidFieldGL`
  instance was constructed), driving three independent slow sine/cosine
  drift cycles (`uTime * 0.07`, `* 0.05`, `* 0.09`, each phase-offset) —
  the three environmental masses are never perfectly still, even with no
  pointer input, satisfying "idle motion... slight drift, slow curl."
- Pointer-reactive layer: `baseRadius` unchanged from the first pass
  (0.32 + intensity), still additively brightens the environmental
  masses rather than drawing a separate shape — "disturbing existing
  material."
- Trigger/start/end states: unchanged from the first pass's write-up
  (idle target `(0.78, 0.22)`, lerp-based settle).

**Diagnostic shell entrance**: unchanged `Reveal` primitive (opacity + y,
now at `delay={0.22}`), not reworked this pass.

### 12. Responsive

- Verified at 390×844: headline still renders as the same 2 fixed
  `<span>` blocks, each of which now wraps further within the narrower
  viewport (4 visual lines at this width — expected, not a regression;
  the fix was for desktop's unnecessary wrap, not a promise of exactly 2
  lines at every width). Diagnostic shell, category chips, and CTA all
  reflow correctly (chips wrap to 2 rows). Supporting copy and the
  scroll cue remain legible at the bottom; the existing "Talk to MODUS"
  floating chat trigger (pre-existing sitewide element, not part of this
  checkpoint) sits close to the copy's last line at this viewport width
  — flagged, not fixed, since it's a pre-existing overlay unrelated to
  this change.
- No dedicated mobile-specific recomposition beyond what naturally falls
  out of the same responsive classes — still an open item from the first
  pass (Section 19/21 there).

### 13. Accessibility

- No regressions: heading hierarchy unchanged, the diagnostic shell's
  input keeps its `aria-label`, category buttons keep `aria-pressed`.
  Forced-light-mode colors on the shell were checked for contrast by eye
  (`neutral-900` on `white/95`, `neutral-400` placeholder) — not run
  through an automated contrast checker this pass.

### 14. Performance

- Homepage first-load JS: 1,529,696 bytes (first pass) → **1,528,434
  bytes (this pass, essentially flat, -0.08%)** — removing the
  standalone `DiagnosticEntry` section from the homepage's render graph
  offset the shader growing from one blob to three organic masses plus a
  third color uniform.
- Shader cost: still a single fragment-shader pass, no new textures, no
  loops over anything but a fixed small number of `blob()` calls (3
  masses × 3 sub-circles + pointer core/trail = 11 `smoothstep` calls
  per pixel, up from 2) — not benchmarked on-device this pass, flagged
  as worth a real frame-time check before calling the field "final,"
  especially on lower-end hardware, since this is meaningfully more
  per-pixel math than the first pass.

### 15. Functional regression

Full Playwright suite re-run after this pass's changes:
**41/43 passed, 1 pre-existing intentional skip, 1 pre-existing
unrelated `AnimatePresence` flake** (same test, same signature as every
prior run this session — not newly introduced). Specifically
re-verified:
- **Homepage diagnostic-entry → `/diagnostic?hint=`**: the exact
  Checkpoint 5 test for this flow passed unmodified — the relocated
  interaction preserves the same placeholder text, category button
  names, and `DiagnosticCTA` usage the test locates by, confirming the
  move didn't change the interaction's observable contract.
- **Full diagnostic happy path, optional-field path**: both passing,
  confirming the homepage change has no reach into `/diagnostic` itself.
- **`customerContext.spec.ts`'s 5 scenarios, `smoke.spec.ts`'s nav/
  language test, `responsive.spec.ts`'s 4-viewport home coverage**: all
  passing.
- **`/motion-lab`**: manually re-checked for console errors after the
  shader rewrite (it also mounts `FluidFieldRawGL` for comparison) — zero
  errors.

### 16. Bugs found and root causes

**Bug — headline still wrapped to 4 lines after the "fix."**
- Symptom: after splitting the headline into two `<span className="block">`
  elements, the rendered page still showed 4 visual lines, not 2.
- Reproduction: screenshot at 1440×900 light mode, visually inspect.
- Root cause: the two spans were each still wrapping internally — "We
  improve how" (3 words at a 116px font) doesn't fit inside a 672px-wide
  container (`max-w-2xl`), so the browser wrapped it again regardless of
  the manual split. The split alone didn't address the actual
  constraint, which was container width vs. font size.
- Fix: widened the container to `max-w-4xl` (896px) and reduced the
  clamp ceiling from 7.25rem to 6.25rem — both together, not either
  alone (confirmed via a second screenshot after each change).
- Proof of fix: screenshot re-inspected, headline now renders as exactly
  "We improve how" / "businesses work." with no further internal wrap at
  1440px.

### 17. Failed approaches / explicit scope decision

**Not attempted: a true fluid dynamics simulation (Splash Cursor's
actual algorithm).** The requester's own follow-up message asked for the
Splash Cursor's real physics (velocity/density/pressure fields, a
pressure Jacobi solve, curl/vorticity confinement, advection across
multiple render-to-texture passes) to be studied and adapted. This was
**not implemented**. Reasoning, stated plainly rather than silently
scoped down: a true incompressible-fluid solve is a materially larger,
specialized piece of engineering — multiple off-screen framebuffers,
several shader programs (advection, divergence, pressure iteration
~20-50 times/frame, gradient subtraction, curl), and real tuning/
debugging time this pass's budget didn't have, and this project's own
`fluidFieldGL.ts` file already carried a prior, honest scope decision
documenting exactly this tradeoff before this session even started.
What was built instead is a **procedural approximation** aimed at the
same qualitative targets the requester listed (organic/non-circular
silhouette, mass present at rest, broad pointer disturbance rather than
a thin trail, idle drift) using layered `smoothstep` circles and
sine-based motion — cheap, single-pass, and genuinely improved (Section
18's blur test), but not the real thing. This is flagged as an explicit
open decision (Section 20), not a silently-missed requirement.

### 18. Screenshots inspected, including the requested blur/silhouette test

Desktop 1440×900, light and dark, normal motion, consent pre-accepted.

- **Hero, dark, desktop**: headline reads as a compact, dominant
  2-line block; diagnostic shell floats as a genuinely bright white
  object against the dark field (the forced-light-surface fix, Section
  10, directly addresses this); fluid field shows a visible lumpy
  silhouette with internal light/dark variation, not a flat glow.
- **Hero, light, desktop**: same structure, field reads as
  pale-sage/green "dense pigment" with a clear organic edge.
- **Blur/silhouette test** (the requester's own explicit QA method):
  generated by downsampling the dark-mode screenshot to 120×75px and
  upscaling with a heavy Gaussian blur, removing all legibility and
  leaving only mass/placement. Result, inspected directly: dark
  background, a large luminous mass bleeding from the upper-right
  quadrant, a light rectangular block (the diagnostic shell) sitting
  left-of-center below a white text mass (the headline), a small bright
  accent point (the CTA) — structurally recognizable against the
  reference's own silhouette (dark ground, luminous upper-right mass,
  bright floating rectangle, headline text block), which the first
  pass's equivalent test (not run formally, but visually: "big white
  block on left / dark empty space on right") would not have passed.
  **This pass's version is judged to pass the blur test at a coarse
  level** — recognizable as "the same kind of composition," not
  identical in proportion or mass complexity.

### 19. Known differences from reference

- Field is a procedural approximation, not a real fluid sim (Section
  17) — less textural/velocity complexity than the reference's actual
  liquid material.
- Diagnostic shell sits in normal document flow below the headline
  rather than absolutely positioned to visually overlap/cross the field
  the way the reference's prompt box does.
- Headline remains left-aligned, not shifted toward center-canvas.
- No dark→light environmental cross-fade, no scroll-driven blur/focus
  text language — both still open from the first pass.
- Mobile hero is still the same responsive classes as desktop, not a
  deliberately-recomposed mobile scene.

### 20. Decisions made

1. Reduced `display-xl`'s ceiling back down (7.25rem → 6.25rem) once
   width/wrapping, not raw size, was identified as the actual headline
   problem.
2. Relocated the diagnostic-entry interaction into the hero and removed
   it from its standalone section, accepting logic duplication between
   `Hero.tsx`'s inline copy and the now-unused `DiagnosticEntry.tsx`
   rather than extracting a shared component this pass.
3. Gave the diagnostic shell a theme-independent forced-light surface,
   a deliberate exception to the project's normal theme-relative token
   convention, reasoned from the reference's own consistent treatment of
   its prompt box.
4. Explicitly did not attempt a true fluid simulation — approximated
   the target qualities procedurally instead, documented as a scope
   decision rather than a silent gap.

### 21. Decisions requiring approval

1. **Whether a true fluid simulation is still wanted.** If the
   procedural approximation's blur-test result isn't convincing enough
   once reviewed at full resolution, building the real thing is a
   separate, larger, dedicated task — recommend scoping it explicitly
   (and separately from further hero polish) rather than attempting it
   inside more "one more tuning pass" iterations.
2. **`DiagnosticEntry.tsx`'s fate.** Now unused on the homepage, logic
   duplicated into `Hero.tsx`. Confirm whether to delete it, extract a
   shared component the hero and any future reuse both consume, or leave
   it as reference/backup.
3. **Headline alignment** — left-aligned vs. the reference's more
   centered placement. Not changed this pass; confirm if it's still
   wanted given how much else changed.
4. **Diagnostic shell's spatial relationship to the field** — normal
   flow below the headline vs. the reference's overlapping/crossing
   placement. A bigger layout change (absolute/layered positioning) if
   pursued further.
5. Items 1–4 from the first pass's own Section 21 remain open
   (`HeroOrbitalSystem`'s destination, whether to continue correcting
   the rest of the homepage now, `RotatingLine`'s fate, dedicated mobile
   recomposition).

### 22. Blockers

None.

### 23. Recommended next checkpoint

Same fork as the first pass's Section 23 — recommend reviewing this
pass's result (ideally at full resolution, not just the blur test) before
deciding whether to (a) continue tuning the hero/field further, (b)
proceed to the rest of the homepage with this as the established
pattern, or (c) scope a dedicated true-fluid-simulation task separately.
Awaiting direction.

---

## Checkpoint 5.5 — Visual Direction Reset (2026-10-01)

### 1. Status

**INCOMPLETE — VISUAL TARGET NOT MET, for the homepage as a whole.**
Scoped-complete for what it covers: Navigation, Hero, and the shared
fluid-field system are rebuilt and verified against the reference. Every
other homepage section (Problem, Process, What MODUS Sees, Capabilities
preview, Cases preview, Platform preview, Pricing preview, Final CTA,
Footer) is **visually unchanged** — still the Checkpoint 3/4 visual
language the reset explicitly objects to. The homepage as a whole still
"clearly resembles the old visual direction" below the first viewport,
so it cannot be marked complete per the requester's own rule. Stopped
here deliberately (not from running out of things to do) to get
hero/nav/fluid-field approved before applying the same depth of rework
to eight more sections, rather than batching unverified work across all
of them at once.

### 2. Objective

Correct the homepage's visual direction so it reads as "an experimental,
high-end technology brand with editorial art direction," not "old MODUS
+ dark mode + motion layer," per the requester's full reset brief —
prioritizing the two elements the brief named as most broken: the
two-column dashboard-style hero, and the dense, developer-tooling-styled
navigation. The fluid/WebGL field — flagged as "too subtle to define the
mood" — needed to become a real compositional element, not a stronger
version of the same flat wash.

### 3. Reference target

`rbp-ai-saas-template.vercel.app` ("Kraft," React Bits Pro AI SaaS
template) — screenshots supplied directly, plus a 37-point written
motion/art-direction brief standing in for an inaccessible reference
video. Treated as a strong behavioral/compositional target (spacing,
scale, pacing, restraint), not a literal template — Kraft's blue/cyan
palette, product name, branding, and the specific "Ask Kraft" AI-prompt
interface are explicitly not reproduced (the Checkpoint 4 brief's own
"not chat, not an AI-prompt pattern" constraint for MODUS's hero still
applies and isn't contradicted by this reset — the reset asks for the
reference's *spatial* behavior, not its specific product UI).

### 4. Before

**Navigation**: 6 primary links (How It Works/Platform/Capabilities/
Results/Company/Pricing) + a visible `MODUS / Online` status dot-and-text
+ `ThemeSwitch` rendered inline as literal text (`Light / Dark / System
(dark now)`) + `LanguageSwitch` rendered inline as literal text (`EN /
NL`) + a user-account control + the Diagnostic CTA — **9 distinct visible
elements/controls** in the bar at rest, all times visible simultaneously
on desktop.

**Hero**: two-column grid (`lg:grid-cols-[3fr_2fr]`), 60% text column /
40% diagram column. Left column held, top to bottom: a `SectionLabel`
("SYS / 01" + "Improvement Infrastructure"), the headline at
`display-lg`/`display-xl` (clamp ceiling 6rem/96px), a 3-sentence body
paragraph, two CTAs (primary + secondary text link), a conditional
`HomeContextBanner`, and a bordered footer strip containing a second mono
label plus a live `RotatingLine` ("Currently examining: ..."). Right
column: `HeroOrbitalSystem`, a ~700-line animated orbital diagram with
its own labeled nodes. **7 distinct visible content elements above the
fold**, excluding nav. Fluid field: flat 11% opacity, full-width
vertical-only mask, identical treatment to every other page.

**Typography**: hero headline's fluid ceiling capped at 6rem (96px).

### 5. After

**Navigation**: 4 primary links (How It Works/Capabilities/Results/
Pricing) + one compact icon-trigger (`NavUtilityMenu`, a `SlidersHorizontal`
icon opening a small popover containing both theme and language choices)
+ the user-account control + the Diagnostic CTA — **4 visible elements**
in the bar at rest (nav links aside), nothing rendered as literal
`Light / Dark / System` text anywhere in the main bar. The online-status
dot/text is removed entirely (not relocated).

**Hero**: single column, `max-w-3xl`. Top to bottom: one small mono
label (the existing process line, "Observe · Diagnose · Implement ·
Measure" — kept, everything else removed), the headline at `display-xl`
(clamp ceiling now 7.25rem/116px, line-height tightened 1.02→1.0), one
short supporting line (the dict body copy's first sentence only — the
full string is unchanged in the dictionary, only the hero's own display
is shorter), one CTA pairing (Diagnostic primary + "See How It Works"
text link), the existing `HomeContextBanner` (kept, functional/
personalization logic), and a small scroll-cue indicator. **5 distinct
visible content elements above the fold.** `HeroOrbitalSystem` is not
rendered in the hero at all. Fluid field: reworked into an asymmetric
radial field (`radial-gradient(ellipse 85% 75% at 88% 8%, ...)`)
anchored off the top-right corner, opacity raised 11%→40% on the wrapper,
shader `baseRadius` raised ~2.5× (0.12→0.3 of viewport), idle alpha floor
raised (0.3→0.42), and the field's own idle/rest position nudged from
screen-center to (0.78, 0.22) so it visibly occupies the upper-right
field at rest, not only once the pointer moves into frame.

**Typography**: hero headline clamp ceiling raised 6rem→7.25rem (+20%).

### 6. Reference vs MODUS comparison

| Reference characteristic | MODUS implementation | Remaining difference |
|---|---|---|
| Extremely sparse hero (headline + one functional element + field) | Hero now: label, headline, one support line, one CTA pair, field | MODUS keeps one small mono process label the reference's hero doesn't have |
| Large environmental visual, partially off-screen, asymmetric | Fluid field reworked to an off-screen-bleeding radial field, upper-right anchored | Reference's field is a smoke/liquid material with velocity-reactive stretch; MODUS's is a softer, more static-looking radial glow at rest — same positioning idea, less textural complexity |
| Oversized display type dominating the viewport | Headline clamp raised to 7.25rem, now the single largest element on the page | Reference's "Design with AI" headline reads comparably large at a glance; not pixel-measured against each other |
| Minimal, calm navigation (4 links + sign-in + 1 CTA) | Nav reduced to 4 links + compact utility icon + sign-in + CTA | Reference's nav has no theme/language control visible at all in the captured frames; MODUS still needs one (it's a real site requirement), compacted into one icon rather than removed |
| Dark→light environmental transition, not an instant swap | Not touched this checkpoint | Open — MODUS's theme switch is still an instant class/variable swap, no cross-fade |
| Scroll-driven blur/focus text reveal | Not touched this checkpoint (existing `TextReveal`/`Reveal` primitives are opacity+y based) | Open |
| Draggable gallery, image bulge, asymmetric media compositions | Not touched this checkpoint (homepage has no gallery section rebuilt yet) | Open — applies to sections below the hero, not yet rebuilt |

### 7. Components removed / relocated / retained

**REMOVED FROM THE HERO'S ROLE (not deleted as files):**
- `HeroOrbitalSystem` — no longer rendered on the homepage. File and its
  ~700 lines of polar-geometry/parallax logic are untouched on disk.
  Reason: it's a diagram explaining MODUS's own system-observation model,
  which is a Technology/How-MODUS-Works argument, not a brand-opening
  one — the reset brief itself suggests this exact relocation
  ("Technology, How MODUS Works, observation/system section").
  **Not yet relocated anywhere** — Checkpoint 6 hasn't started.
- `RotatingLine` (the "Currently examining: ..." live cycling line) and
  its `examiningOverride` state wiring — removed from the hero along
  with the bordered footer strip it lived in. File untouched. No current
  plan to reuse it; flagged as a decision below.
- `SectionLabel` ("SYS / 01" technical id badge) — removed from the hero
  specifically; the component itself is still used elsewhere
  (`ReviewScreen`, `DiagnosticShell`, etc.) and untouched.

**RELOCATED:**
- None yet — see `HeroOrbitalSystem` above; its destination is a
  Checkpoint 6 decision, not made here.

**REMOVED FROM THE NAV BAR (relocated, not deleted):**
- The literal `Light / Dark / System (... now)` text and the literal
  `EN / NL` text — both moved into `NavUtilityMenu`'s popover, same
  underlying `useTheme()`/`useLocale()` contracts, same `ThemeSwitch`/
  `LanguageSwitch` components still used verbatim in the footer and
  mobile menu (untouched there).
- Platform and Company links — moved out of the primary desktop nav row
  only; both still present in the footer (already had the full set) and
  in `MarketingMobileNav` (now explicitly given the full 6-link set via
  a separate `mobileLinks` array, so mobile loses nothing).
- The `MODUS / Online` status text — removed outright, no new location.
  It read as a system-status indicator, not a positioning statement; the
  reset brief's "dashboard/command-center language" complaint named this
  exact pattern.

**RETAINED, UNCHANGED:**
- `DiagnosticCTA`, `ClientUserButton`, `MarketingMobileNav`,
  `HomeContextBanner`, `Container`, `Reveal`/`TextReveal`,
  `MagneticButton` — all reused as-is; none of this checkpoint's work
  required a new primitive beyond `NavUtilityMenu`.

**NEW COMPONENT:**
- `NavUtilityMenu` (`src/components/ui/NavUtilityMenu.tsx`) — compact
  icon-trigger + click-outside/Escape-dismissible popover wrapping the
  existing theme/locale contexts directly (not wrapping `ThemeSwitch`/
  `LanguageSwitch` as components, to get the compact row styling the nav
  needed without changing those two components' own public behavior
  anywhere else they're used).

### 8. Typography

- Hero headline token (`display-xl` in `tailwind.config.ts`): clamp
  ceiling `6rem` → `7.25rem` (96px → 116px, +20.8%), floor unchanged at
  `3.25rem`, line-height `1.02` → `1.0`. This is a shared token — every
  other current consumer was checked: none exist yet (`grep` confirms
  `Hero.tsx` is still the only file using `display-xl`), so this is a
  hero-only change in practice, not a silent site-wide typographic shift.
- Hero supporting copy: now renders only the dict string's first
  sentence (`t.body.split(". ")[0]`), down from the full 2-sentence
  paragraph. The dictionary string itself is unchanged — this is a
  display decision in `Hero.tsx`, not a content edit, and the full copy
  remains available if any other surface needs it later.
- Process label demoted from "small label + separate bordered mono
  strip with a second label" (2 mono elements) to one mono line, same
  copy (`t.processLabel`), same size class.

### 9. Spacing / layout

- Hero container: `grid-cols-[3fr_2fr]` two-column → single column,
  `max-w-3xl` (768px) content width against a 1440px+ viewport — roughly
  53% max width versus the old layout's ~60% *text column* width (the
  old grid's right 40% was occupied by the orbital diagram, now open
  field).
- Hero vertical rhythm: `min-h-[100svh]` retained (still a full-viewport
  opening section), but internal stacking simplified from 6 vertically
  stacked reveal blocks to 5, with the removed `RotatingLine` strip's
  `border-t` + padding gone.
- Nav height/scroll behavior (`h-20` → `h-14` on scroll, blur backdrop)
  unchanged — not part of this checkpoint's scope.

### 10. Color / theme

- No new tokens introduced. The fluid field's theme-aware color pairs
  (`COLORS.light`/`COLORS.dark` in `FluidFieldRawGL.tsx`) are unchanged —
  only its radius/alpha/position changed, so light mode still resolves
  to the deeper inky green and dark mode to the brighter luminous green
  already established in Checkpoint 2.
- Verified live in both themes (Section 18 below) — light mode shows a
  soft grey-green glow against off-white; dark mode shows a visibly
  luminous green glow against near-black. Both read as intentional, not
  as "dark mode is the same design with inverted colors."

### 11. Motion

**Hero field**
- System: raw WebGL2 (`FluidFieldRawGL`/`FluidFieldGL`), unchanged
  rendering pipeline.
- Trigger: pointer position/velocity (via `pointermove`) + an idle
  settle toward a fixed off-center target `(0.78, 0.22)` set once on
  mount (new this checkpoint — previously defaulted to screen-center via
  the shared physics class's own hardcoded initial state; this instance
  now overrides it post-construction via the existing public
  `setPointer()` API, so the shared `FluidFieldPhysics` class default is
  untouched and `imageBulgeGL.ts`'s separate use of that same class is
  unaffected).
- Start state: `smoothed = (0.5, 0.5)` (class default) at the instant of
  mount. End/rest state: lerps to `(0.78, 0.22)` over roughly 1–2 seconds
  (exponential `lerpFactor = 1 - 0.001^dt`), then holds until real
  pointer movement.
- Desktop: full WebGL field. Mobile/touch: not mounted at all
  (`isCoarsePointer()` check, unchanged, pre-existing).
- Reduced motion: canvas not mounted (unchanged, pre-existing —
  `usePrefersReducedMotion()` gate in `FluidFieldRawGL.tsx`).

**Hero content**
- Still the existing `Reveal`/`TextReveal` primitives (opacity + small
  y-translate, staggered delays 0.08–0.5s). Not reworked this
  checkpoint — the reset brief's "blur/focus" and "morphing" motion
  language is **not yet implemented** anywhere in the hero; flagged as
  an open item below, not silently skipped.

**Nav utility popover**
- System: `motion/react` `AnimatePresence` + a single `motion.div`
  (opacity + 4px y, 0.15s). Mutually exclusive mount (open or not), so
  this is not a repeat of the Checkpoint 6-pre-task `AnimatePresence`
  finding — there's never more than one child.

### 12. Responsive

- Mobile: hero typography scales via the same `clamp()` the desktop
  uses — no separate mobile-specific composition was built this
  checkpoint (the reset brief's Section 34 wants a deliberately
  simplified mobile scene, not a shrunk desktop one; this is an **open
  item**, not yet addressed — current mobile hero is the same JSX at a
  narrower viewport, verified clean (no overflow, readable) but not yet
  intentionally recomposed per the reference's mobile guidance).
- Mobile nav: unaffected in content (full 6-link set preserved via the
  new `mobileLinks` array) — only the desktop bar's visible row changed.
- Fluid field on mobile: same shared component/mask: at 390px width the
  radial field's `88%, 8%` anchor sits mostly off-canvas to the right,
  so less of it is visible than on desktop — an incidental consequence
  of reusing one fixed-viewport-coordinate mask, not a deliberate mobile
  treatment. Verified via screenshot (Section 18) — present but faint.

### 13. Accessibility

- `NavUtilityMenu`: `aria-expanded` on the trigger, `aria-label`
  ("Preferences"), Escape-to-close, click-outside-to-close. Options are
  plain `<button>`s with visible text labels (no icon-only controls).
  Not yet audited with a screen reader — flagged as not done, not
  claimed as verified.
- Hero: heading hierarchy unchanged (`<h1>` still the headline). Scroll
  cue indicator is `aria-hidden` via its wrapper (decorative only, no
  information conveyed only through it — the page's own scrollability
  doesn't depend on noticing it).
- No new color-only-signal patterns introduced.

### 14. Performance

- Homepage first-load JS (production build, `route-bundle-stats.json`):
  **1,514,605 bytes → 1,529,696 bytes (+15,091 bytes, +1.0%).** Net
  change despite removing `HeroOrbitalSystem`/`RotatingLine` from the
  render path — `NavUtilityMenu` (new, pulls in one more `lucide-react`
  icon) plus the fact that neither removed component was deleted from
  the bundle graph (Hero.tsx no longer imports them, but nothing in this
  checkpoint confirmed whether tree-shaking fully dropped them from a
  shared chunk vs. just this route's own chunk) account for the small
  net increase. Not investigated further given the size is within noise
  for a visual-direction checkpoint; flagged for the eventual
  performance-pass checkpoint, not re-litigated here.
- WebGL: still lazy-loaded (`next/dynamic`, `ssr:false`), still exactly
  one canvas mounted site-wide (the shared `MarketingFluidField`), still
  skipped on `/diagnostic` and on touch/coarse-pointer devices and under
  reduced motion — none of that lifecycle logic was touched.
- No new `ScrollTrigger`/GSAP usage added this checkpoint.
- No obvious layout shift observed in the screenshots inspected (Section
  18) — not measured with a CLS tool, visually checked only.

### 15. Functional regression

Explicitly re-verified, not assumed, via the full Playwright suite after
every substantive change:
- **Free Diagnostic CTA**: `DiagnosticCTA` unchanged, still renders via
  `useCustomerContext()`'s personalized label in both the hero and nav —
  covered by `customerContext.spec.ts`'s 5 scenarios, all passing.
- **`/diagnostic`**: full happy-path + optional-field specs both passing
  (`diagnostic.spec.ts`), unaffected by homepage changes (different
  route, different component tree).
- **Sign-in link**: `ClientUserButton` untouched, still rendered in nav.
- **EN/NL**: re-verified live via the updated `smoke.spec.ts` test (see
  Section 16 — the old test broke because the control moved, not because
  switching broke; fixed and passing, headline text confirmed to change
  and revert correctly).
- **Theme**: `useTheme()`/`setTheme()` contract unchanged; `NavUtilityMenu`
  calls the same hook `ThemeSwitch` always called.
- **Cookies/consent**: `ConsentBanner` untouched.
- **Navigation**: `smoke.spec.ts`'s nav-link assertion re-verified
  against the new 4-link row.
- **Mobile navigation**: `MarketingMobileNav` unchanged, now receives
  the full 6-link `mobileLinks` set explicitly (verified via
  `responsive.spec.ts`'s existing 4-viewport home/pricing/diagnostic/
  private-login coverage, all passing, plus manual screenshot read).
- **`/app` isolation**: not touched this checkpoint; no new provider or
  pathname-suppression logic added.
- **`/private` isolation**: not touched this checkpoint.

Full suite result: **41/43 passed, 1 pre-existing intentional skip
(`private.spec.ts`'s credentials test), 1 failed** — see Section 16,
the one failure is the already-documented, already-investigated
`AnimatePresence` flake from the paused Checkpoint 6 pre-task, unrelated
to any change in this checkpoint (same failure signature, same test,
predates this session's homepage work).

### 16. Bugs found and root causes

**Bug 1 — `smoke.spec.ts`'s nav test broke by design, not by accident.**
- Symptom: `getByRole("link", { name: "Platform" })` inside the primary
  nav landmark, and `getByRole("button", { name: "NL" })` directly in
  the nav bar, both stopped resolving.
- Reproduction: run `npx playwright test e2e/smoke.spec.ts -g "nav links"`.
- Root cause: Platform was intentionally moved out of the primary nav
  row (Section 7); the language switch was intentionally moved into
  `NavUtilityMenu`'s popover (closed by default), so a bare
  `getByRole("button", {name: "NL"})` no longer finds an attached,
  visible element without first opening the popover.
- Fix: updated the test to assert on "Capabilities" (still in the
  4-link row) and to click the "Preferences" trigger before locating
  `NL`/`EN`, scoped to `getByRole("banner")` to disambiguate from the
  footer's own always-visible `LanguageSwitch` instance.
- Proof of fix: `npx playwright test e2e/smoke.spec.ts -g "nav links"` —
  1 passed, headline text confirmed to change to the Dutch string and
  revert to the exact original English string.

**Bug 2 (found, not fixed) — `getByRole("button", {name:"Preferences"})`
is ambiguous against the footer's "Privacy Preferences" link.**
- Symptom: `strict mode violation... resolved to 2 elements`.
- Root cause: Playwright's accessible-name matching is substring-based
  by default; "Preferences" matches both the new nav trigger
  (`aria-label="Preferences"`) and the footer's "Privacy Preferences"
  text link.
- Fix: added `exact: true` to the test's locator. No product code
  change needed — not a real ambiguity for a real user (the two controls
  are visually and positionally distinct), only a test-matching
  precision issue.
- Proof of fix: same test run as Bug 1, now passing.

### 17. Failed approaches

- **Tried**: making the fluid field read as "large and off-screen"
  purely via a CSS mask (a radial-gradient positioned top-right) without
  changing the field's own rendered content.
- **Result**: the field's actual WebGL content is small (shader
  `baseRadius` originally 0.12 of the viewport) and centered at
  `(0.5, 0.5)` by default — the mask could only reveal whatever sliver
  of that small, centered blob happened to fall inside the masked
  region, which was nearly nothing. First screenshot after this change
  showed only a faint, tiny circle, not a field.
- **Diagnosis**: masking controls *visibility*, not *where the content
  actually is*. Fixed by also increasing `baseRadius` (shader constant,
  shared file) and moving the field's own idle target via the instance's
  public `setPointer()` call (Section 11) — the mask alone was
  insufficient and is documented here so the same mistake isn't repeated
  if this needs further tuning later.
- Not abandoned outright — the mask is still in place and still doing
  real work (shaping where the now-larger field is allowed to show), it
  just isn't sufficient on its own, which is the actual finding.

### 18. Screenshots inspected

Desktop 1440×900 and mobile 390×844, light and dark, normal motion
(reduced motion specifically excluded from these shots since it disables
the WebGL canvas entirely and would show nothing), consent pre-accepted
via seeded `localStorage` so the banner doesn't obscure the frame.

- **Hero, light, desktop**: headline reads as the clearly dominant
  element (5 visible lines-worth of vertical space at this width);
  fluid field visible as a soft grey-green glow occupying roughly the
  right half of the viewport, correctly fading before reaching the
  headline column. Nav reads calm — 4 links, one icon, Sign In, one CTA
  button, no literal theme/language text anywhere.
- **Hero, dark, desktop**: field reads as genuinely luminous (bright
  green against near-black, not just "the same glow in different
  colors") — closest single frame to the reference's own dark-hero mood
  of anything built this session. White headline text, high contrast,
  no legibility issues against the field (field is masked away from the
  text column).
  "{:is-visible" field anchored where expected, bleeding off the
  top-right corner rather than sitting as a centered, fully-contained
  blob.
- **Hero, light, mobile**: not separately re-inspected after the final
  field tuning (dark/mobile was; light/mobile checked at the earlier,
  weaker field intensity only) — flagged as a gap, not silently skipped.
- **Hero, dark, mobile**: oversized readable headline, generous
  whitespace, visible scroll-cue dot, hamburger-only nav (no visible
  clutter), CTA pair stacked cleanly. Fluid field present but
  noticeably fainter than desktop (expected, per Section 12 — the fixed
  top-right mask anchor sits mostly off-canvas at 390px).

### 19. Known differences from reference

- Reference's field behaves as a textured liquid/smoke material with
  velocity-reactive stretching and a visible directional trail; MODUS's
  field is a smoother, more uniform radial glow — same positioning
  strategy, less surface complexity. The underlying shader already has a
  trail/velocity term (Section 17's `FLUID_FRAGMENT_BODY`); it just isn't
  as visually pronounced as the reference's at current intensity values.
- No dark→light environmental cross-fade transition exists yet (Section
  6) — MODUS's theme switch is instant.
- No scroll-driven blur/focus text reveal language implemented yet.
- No gallery/asymmetric-media section exists on the homepage yet — every
  section below the hero is unchanged from Checkpoint 4.
- Reference nav has zero visible theme/language control in any captured
  frame; MODUS keeps one (compacted to an icon) since both preferences
  are real product requirements, not optional chrome.

### 20. Decisions made

1. Reduced the primary desktop nav from 6 to 4 links, keeping all 6 in
   the footer and mobile menu — no link is actually gone, only the top
   bar's visible row.
2. Removed `HeroOrbitalSystem` from the hero entirely rather than
   shrinking or restyling it in place, per the brief's explicit "do not
   polish, rebuild" instruction.
3. Raised `display-xl`'s clamp ceiling by ~21% as a shared token change
   (verified it has no other current consumers, so this is effectively
   hero-scoped today).
4. Built one new compact `NavUtilityMenu` component rather than
   restyling `ThemeSwitch`/`LanguageSwitch` in place, so their existing,
   still-used-elsewhere behavior (footer, mobile menu) stays exactly as
   it was.
5. Fixed the fluid field's visibility via both a larger shader radius
   and an off-center idle target, not the mask alone (Section 17).

### 21. Decisions requiring approval

1. **Where `HeroOrbitalSystem` goes.** Removed from the hero, not yet
   relocated. The brief suggests Technology or How MODUS Works —
   neither exists as a redesigned page yet. Recommend deciding this
   explicitly before Checkpoint 6 starts, rather than defaulting to
   whichever page gets built first.
2. **Whether to continue correcting the rest of the homepage now** (the
   brief's own "complete the homepage correction first" instruction) or
   get hero/nav/field approved first, given how much visual authority
   they have over everything scrolled past them. This report stops at
   hero/nav/field specifically to get that read before expanding to 8
   more sections' worth of unverified work.
3. **The removed `RotatingLine`/"Currently examining" live element** —
   no current plan to reuse it anywhere. Confirm it's fine to leave
   unused (not deleted) rather than finding it a new home.
4. **Mobile-specific hero recomposition** (Section 12/19) — not yet
   built; confirm this is worth a dedicated pass before Checkpoint 6, or
   can ride along with it.

### 22. Blockers

None.

### 23. Recommended next checkpoint

Given this report's own Section 1 status, recommend **not** proceeding
to Checkpoint 6 (Core Content Pages) yet. Two reasonable next steps,
either is defensible — flagging rather than picking unilaterally:

(a) Continue the homepage correction checkpoint — apply the same
    rebuild-not-polish treatment to Problem, Process, What MODUS Sees,
    Capabilities/Cases/Platform/Pricing previews, and Final CTA before
    calling the homepage itself done, or

(b) Approve hero/nav/field as a checkpoint on its own and explicitly
    defer the rest of the homepage to run alongside Checkpoint 6/7/8's
    own section-level work (since several of those sections — Problem,
    Process — have direct equivalents on the pages Checkpoint 6 is
    about to redesign anyway, and could be done once, consistently,
    rather than twice).

Awaiting direction before continuing either way.

---

## Checkpoint 5 — Diagnostic (2026-09-30)

**Status: complete. Stopped for approval, per instruction. No diagnostic
business logic changed — presentation/interactions only**, with one
narrow, explicitly-scoped exception: a real submission-failure state was
added (Section 19 required verifying this, and the pre-existing behavior
turned out to be a genuine bug — see below). The 6-step state machine,
question order, validation rules, resume behavior, and submission contract
are otherwise untouched.

### Pre-checkpoint: approved hero fluid-field tuning

Before starting the Diagnostic work, per the user's explicit pre-approval:
`MarketingFluidField.tsx`'s base opacity raised 7%→11% and a vertical CSS
mask added (`black` through ~60vh, fading to transparent by ~110vh),
concentrating the existing restrained effect near the hero specifically
without touching `Hero.tsx` or any homepage structure. Presentation-only;
every other page keeps the same top-of-page presence as before.

### Re-audit before styling (Section 2)

Read every diagnostic file before changing anything (`DiagnosticShell.tsx`,
`ProgressBar.tsx`, `ReviewScreen.tsx`, `SubmitTransition.tsx`,
`ResultView.tsx`, `OptionGrid.tsx`, `ValidatedInput.tsx`,
`ValidatedTextarea.tsx`, `PhoneInput.tsx`, `StepBusiness.tsx`, `schema.ts`,
~30 files / 3497 lines total). Confirmed against the Checkpoint 0 audit:
6 steps (Business/Operations/Systems/Friction/Priorities/Contact), each a
group of several related fields, not one field per step — this shaped the
whole redesign (see Section 4 below). Confirmed character-based (not
word-based) free-text limits via `schema.ts`'s `textareaSchema(min, max)`.
Found two small pre-existing theme-token bugs while reading (fixed as
part of this checkpoint, not left for later): `ReviewScreen.tsx`'s
consent checkbox used a hardcoded `accent-[#123C2D]` instead of the
theme-aware `accent-modus`; `ResultView.tsx` used `bg-white` twice instead
of `bg-paper`.

### Section 4 — "one question at a time"

Resolved the tension between this instruction and the real state machine
(each step is a multi-field group, not one question) by treating the
**step** as the atomic unit: added a new large `stepHeadlines[step]`
heading per step (`dict.diagnosticShell.stepHeadlines`, 6 short
question-style phrases, one per step, en/nl) rendered above that step's
existing fields, replacing the previous small duplicate
`"03 / Contact"`-style label. Fragmenting into per-field sub-screens
would have restructured the flow itself — explicitly forbidden without
approval, and not what "one question at a time" needs to mean given the
state machine's real shape.

### Section 5 — progress system

`ProgressBar.tsx` fully rewritten: the previous six-circle-badges +
connecting-lines + "STEP 03/06 · 50% COMPLETE" combination replaced with
exactly the brief's own suggested minimal form — a `"01 / 06"` counter
plus six restrained markers (a short filled line for the active step,
dim dots for the rest), no percentage text. `role="progressbar"` with
`aria-valuenow/min/max` for screen readers.

### Section 6 — transitions

The step-content block now blurs+fades on change (`filter: blur(4px)→
blur(0px)` alongside the existing opacity/y), via the same lightweight
keyed-remount pattern as before (not `AnimatePresence`) — safe, already
proven. Added focus management: after a step change (not on first
mount), focus moves to the new step's heading (`tabIndex={-1}` + `.focus()`
in a `useEffect`), so keyboard/screen-reader users land somewhere logical
instead of wherever the previous Continue/Back button was (Section 21).

### Section 7 — inputs

`ValidatedInput.tsx`/`OptionGrid.tsx` reviewed and left unchanged — already
satisfied the brief (large 54px fields, theme-aware tokens, clear
border+icon+text validation states, restrained selected-tile treatment).
`PhoneInput.tsx` had one real, pre-existing bug matching this project's
own documented bug class: its validation-message `AnimatePresence` used
`mode="wait"`, the exact pattern already banned project-wide after an
earlier "content stuck invisible" incident (see `BRIEF_CHECKLIST.md`'s
"Bug fix — diagnostic... could get permanently stuck invisible" entry).
Fixed by removing `mode="wait"` (the two messages are mutually exclusive,
so the default mode is safe here).

### Section 8 — word/character limits

Kept as-is: `ValidatedTextarea.tsx` already shows the real character count
(`"328 / 500"`) as restrained `font-mono` metadata, turning signal-red at
the limit — confirmed via `schema.ts` that the real implementation is
character-based, so it was **not** relabeled "words" to match the brief's
literal example; the brief itself says to use "the current equivalent
based on actual implementation."

### Section 11 — Continue/Back

Relabeled the generic step button from "Next" → **"Continue"**
(`dict.diagnosticShell.next`, en/nl) per the brief's literal
"CONTINUE →"/"← BACK" instruction; "Back" was already correct. The final
step's button keeps its own distinct "Review" label (a different action).
Both buttons already carry directional arrow icons. Updated the two
existing Playwright specs (`diagnostic.spec.ts`, `customerContext.spec.ts`)
that asserted on the old "Next" button name — a label rename, not a
logic change, same as Checkpoint 4's "Website" vs "WEBSITE" precedent.

### Section 13 — homepage entry-context hint

Added the narrow, explicitly-sanctioned exception: `DiagnosticCTA` gained
an optional `hint` prop that appends `?hint=<category>` to its link, but
**only** when `nextBestAction.id === "RUN_DIAGNOSTIC"` (a genuinely new
visitor — a returning visitor's link may point at an in-progress
diagnostic, a profile, or an external proposal URL, none of which a
homepage category chip is relevant to). `DiagnosticEntry.tsx` (Checkpoint
4, homepage) now passes its selected category through this prop.
`DiagnosticShell.tsx` reads `?hint=` via `useSearchParams()` on mount and,
if present, shows one small `"Continuing from · Website"` line on the
intro screen only — purely visual acknowledgment. Never touches
`sessionStorage`, `DiagnosticAnswers`, or `canProceed`; verified live that
starting the diagnostic after arriving with a hint still lands on a
genuinely empty first step.

### Sections 14/22 — visual environment / performance

`/diagnostic` is under the `(marketing)` route group and inherited
`MarketingFluidField` by default. Per Section 22's explicit instruction
("if the fluid field isn't materially improving the diagnostic, reduce or
disable it here"), `MarketingFluidField.tsx` now checks `usePathname()`
and returns `null` on `/diagnostic` — the WebGL canvas never mounts on
this route at all (not just hidden), every other marketing page is
unaffected. Confirmed via the production build's own
`route-bundle-stats.json`: `/diagnostic`'s first-load JS is **1,423,335
bytes**, the lightest of all seven marketing-tier routes (1.44M–1.51M)
despite being the most feature-dense page in that set (6 step components,
pricing engine, PDF generation, review scheduling).

### Section 18 — completion state

Reviewed against the brief's "technical label → large confirmation →
explanation → preserved CTAs" shape — `ResultView.tsx` already matches it
well ("Diagnostic / Received" → "Here's what stands out." → explanation →
preserved estimate/PDF/scheduling/next-steps). Only the two `bg-white`
fixes above were needed; no rebuild.

### Section 19 — error/failure state (the one real logic addition)

**This was investigated, not assumed handled.** Before this checkpoint,
a failed submission (`submitDiagnostic` resolving `{ok: false}`) was
silently swallowed: `SubmitTransition`'s 1450ms animation timer called
`onSubmitDone` unconditionally, which cleared the saved draft
(`clearDiagnosticState()`) and showed the **success** result screen
regardless of whether the server actually accepted the submission. A real
user whose submission failed (e.g. the API's own 429 duplicate-email
guard, a transient 500) would have seen "Diagnostic Received," believed
they were done, and had their answers wiped either way — silently losing
real business inquiries. This is exactly the gap Section 19 asked to be
checked for, not assumed already correct.

Fixed: `submit()` now stores the in-flight request's promise in a ref;
`onSubmitDone` (still fired by `SubmitTransition`'s own fixed-length
animation, so the loader still feels quick and deterministic) awaits that
promise and branches — on failure, tracks `diagnostic_submit_failed` (the
event already existed, it just had no UI consequence before) and shows a
new `submit_error` screen; on success, unchanged. The new screen follows
Section 19's own requirements: calm technical label ("Diagnostic / Not
Sent"), plain explanation ("That didn't go through... your answers are
still here"), a "Back to review" action, and a "Try again" action that
re-calls `submit()`. Critically, **the saved draft is not cleared on
failure** (`clearDiagnosticState()` only runs on the success path now),
so a hard refresh after a failed submission still resumes normally via
the existing recovery flow. New dict strings added in both en/nl.

### Section 20 — analytics

`diagnostic_submit_failed` now actually reaches the user (previously
fired into the void with no screen change) rather than being a new event
— no duplicate-firing risk introduced; the submit/track call sites are
unchanged in number, only their downstream UI consequence changed.

### Sections 15–17 — theme, mobile, reduced motion

Verified via Playwright screenshots at desktop (1440×900) and mobile
(390×844) × light/dark, across intro, mid-flow, a long free-text answer,
an email-validation error, and the review screen (10 screenshots total,
all read and visually inspected, not just captured) — see "Visual
observations" below. `responsive.spec.ts`'s existing 4-viewport ×
reduced-motion check for `/diagnostic` passes with zero horizontal
overflow at any size, including mobile.

### A significant pre-existing bug found, partially fixed, not fully resolved

While building and testing the new `submit_error` screen, Playwright
interactions intermittently failed in ways that traced back to a real,
**pre-existing, site-wide** bug — not introduced by this checkpoint,
confirmed present on completely untouched route pairs (e.g. clicking a
plain "Pricing" nav link from the homepage, or "Platform" from
`/pricing`, with zero diagnostic-related code involved).

**What's happening:** every client-side page navigation goes through
`PageTransition.tsx`'s `<AnimatePresence><motion.div key={pathname}>`
crossfade. Under the installed `motion@^11.15.0` + React 19.2.8
combination, `AnimatePresence`'s exit-completion signal intermittently
never fires, so the previous page's content sometimes never actually
unmounts — it stays stacked underneath the new page, invisible-ish but
still present, still in the DOM, occasionally still intercepting pointer
hit-testing. The exact same failure mode reproduces inside
`DiagnosticShell.tsx`'s own internal screen-switching `AnimatePresence`
(form→review→submitting→result), even though every screen there already
declares `initial`/`animate`/`exit` correctly — ruling out a simple
missing-prop mistake and pointing at a library/React-19-compatibility
issue (a commonly reported class of issue for `motion`/Framer Motion v11
pre-dating that library's later explicit React 19 support).

**What was fixed:** `PageTransition.tsx`'s `motion.div` was missing its
`exit` prop entirely (a real, if partial, cause — without one,
AnimatePresence has nothing to animate to completion at all). Added the
symmetric `exit={{ opacity: 0, filter: "blur(4px)" }}`. This is a genuine
improvement — confirmed via Playwright that the stale element now
correctly targets invisible instead of sitting at full opacity — but did
**not** fully resolve the underlying issue; duplicate DOM content after
navigation still reproduces roughly 1-in-4 to 1-in-5 times in repeated
testing, on both touched and untouched routes alike.

**Why not fixed further here:** the real fix is very likely upgrading the
pinned `motion` package to a version with confirmed React 19 support —
that's a site-wide dependency change affecting every animated component
on every route, well outside a "Diagnostic redesign" checkpoint's mandate
(Section 23: other pages' interiors are explicitly off-limits except to
*document* a shared-primitive bug), and it needs its own full regression
pass, not a rushed fix bundled into this one. Documented here and inline
at both `PageTransition.tsx` and `DiagnosticShell.tsx`'s AnimatePresence.

**Practical impact on this checkpoint's own tests:** the new
`submit_error` retry-click test (`e2e/diagnostic-checkpoint5.spec.ts`)
occasionally needs a generous timeout and a `{force: true}` click to work
around this exact issue — documented inline in the test itself, not
silently worked around. **This is very likely also an occasional
real-user-facing issue in production** (not just a test artifact), given
it reproduces on genuine navigation clicks, not Playwright-specific
timing. Recommend treating this as the **first priority for Checkpoint
6 or a dedicated fix-it task**, given its severity and site-wide reach.

### Section 23 — other page interiors

Touched beyond `/diagnostic` only for the two shared-primitive bug fixes
above (`PageTransition.tsx`, `MarketingFluidField.tsx`) and the
`DiagnosticCTA.tsx`/`DiagnosticEntry.tsx` pairing for Section 13's hint —
all documented here, all additive/non-breaking for every other caller.
No other page's interior was redesigned.

### Files changed

`src/components/diagnostic/{DiagnosticShell,ProgressBar,ReviewScreen,
ResultView,PhoneInput}.tsx`, `src/components/motion/{MarketingFluidField,
PageTransition}.tsx`, `src/components/ui/DiagnosticCTA.tsx`,
`src/components/sections/DiagnosticEntry.tsx`,
`src/lib/i18n/dictionaries/{en,nl}.ts` (new `diagnosticShell.stepHeadlines`/
`hintPrefix`, new `diagnosticSubmitError` block, `next: "Next"` →
`"Continue"`/`"Verder"`).

### Files NOT changed (reviewed, found already correct)

`OptionGrid.tsx`, `SubmitTransition.tsx`, `ValidatedInput.tsx`,
`ReviewScreen.tsx`'s/`ResultView.tsx`'s overall structure (only the two
token fixes applied), every step component's field-level logic, `schema.ts`,
`rules.ts`, `submit.ts`'s request/response contract, `storage.ts`.

### Tests performed

`tsc`/`eslint`/`build` clean throughout. `vitest` 22/22. Full Playwright
regression: 42/43 (1 pre-existing intentional skip) — includes the two
updated pre-existing specs (label rename) plus a new dedicated
`e2e/diagnostic-checkpoint5.spec.ts` (kept, not deleted, since it covers
genuinely new behavior this checkpoint added: step headline/progress
advance+retreat with answer preservation, the homepage hint end-to-end,
the submission-failure/retry path via network interception rather than
racing the API's real 60s duplicate-email window, and fluid-field
presence/absence on `/diagnostic` vs the homepage). Also manually
re-verified the existing happy-path and optional-field specs after the
label rename. Database test rows cleaned up after every run (scoped to
distinctive test emails only).

### Visual observations (screenshots actually read, not just captured)

Intro, mid-flow (Systems step with the live "Initial Profile" panel),
a long free-text answer near its character limit, an email-validation
error, and the review screen — each at desktop (1440×900) and mobile
(390×844), in both light and dark (10 states total, 40 screenshots incl.
intermediate steps). Confirmed: solid-contrast headline text in both
themes, the green `accent-modus` consent checkbox fix visible and correct,
character counter reads cleanly ("328 / 500"), validation error shows red
border + red message text + disabled Continue (not color-only), mobile
fields remain full-width and touch-sized, dark mode's accent green and
surface tones read correctly throughout. One additional real-but-known
finding while inspecting a full-page mobile review screenshot: unusually
large empty space above the visible content — traced to the same
AnimatePresence issue documented above (a stale, taller previous-screen
element still occupying the DOM), not a new mobile-specific layout bug.

### Known limitations

- The pre-existing AnimatePresence/`motion`-version bug documented above
  is not resolved, only partially mitigated. This is the most important
  open item from this checkpoint.
- `ValidatedInput.tsx`'s error-state red (`text-signal`) still carries the
  same pre-existing contrast limitation Checkpoint 1 already documented —
  unchanged, per the brief's own reminder to remember rather than re-fix
  it here.
- No dedicated hard-refresh-mid-flow or virtual-keyboard-viewport test was
  automated this checkpoint beyond the existing `responsive.spec.ts`
  mobile coverage and the pre-existing sessionStorage-resume spec in
  `customerContext.spec.ts`'s FLOW A — both already exercise the relevant
  mechanisms (`saveDiagnosticState`/`loadDiagnosticState`), not re-built.

### Anything intentionally deferred

A full root-cause fix for the `motion`/React-19 AnimatePresence issue
(needs a package upgrade and site-wide regression, flagged above as the
top priority next task, not attempted here).

### Decisions requiring approval before Checkpoint 6

1. **The `motion` package/React-19 AnimatePresence bug** (see above) —
   recommend this become the very next piece of work, ahead of Checkpoint
   6, given it's a real, site-wide, occasionally user-facing reliability
   issue, not a Diagnostic-specific cosmetic one. Needs its own scoped
   task with full regression testing across every route.
2. **The submission-failure state is a genuine new capability**, not pure
   restyling — flagging explicitly since the brief's default expectation
   for this checkpoint was "no business logic changed." The change is
   narrowly scoped (a missing failure path, now handled) and was required
   by Section 19's own explicit instruction to verify this exact thing
   rather than assume it was already correct — but it's still new
   behavior, not a rename, and the user should confirm it's wanted as
   described (preserve the draft, offer retry, don't fabricate a fake
   success).

### Recommended next checkpoint

Given the severity of the AnimatePresence finding, recommend addressing
that (likely a `motion` package upgrade plus full site regression) before
**Checkpoint 6**, whatever that's scoped to in the master plan. Awaiting
go-ahead.

---

## Checkpoint 4 — Homepage (2026-09-30)

**Status: complete. Stopped for approval, per instruction.** The first
checkpoint where the V2 art direction is visibly, substantially different
from the old site — oversized `display-xl`/`display-lg` typography, the
restrained WebGL fluid field live behind the hero, a GSAP-pinned signature
process section, a real diagnostic-entry interaction, and a choreographed
light→dark→light rhythm down the page (paper → mineral → **inverted** →
surface → paper → paper → paper → **modus** → inverted footer). Homepage
content only — no other page's interior was touched, confirmed by grep
(only `page.tsx` and the components it newly imports changed).

### Pre-work: the two required token-inversion fixes (Sections 1–3 of the instruction)

Checked every component `MODUS_REDESIGN_REPORT.md`'s Checkpoint 3 entry
flagged as a likely candidate, not assumed from that old list:

- **`Philosophy.tsx` — turned out not to need a fix at all.** Direct
  inspection showed it uses `bg-surface/60` (already theme-relative,
  correct), not `bg-ink`/`text-paper` — the Checkpoint 3 flag was an
  overcautious guess from memory of this project's much earlier "dark
  Philosophy section" history, not the component's actual current code.
  Correcting that record here rather than silently fixing a bug that
  doesn't exist.
- **`ClientAuthOverlay.tsx`** — a real instance: its modal backdrop
  (`bg-ink/30`) fixed to `bg-inverted/30`; its two submit buttons'
  `text-paper` fixed to `text-modus-foreground` (the coincidentally-
  fragile-but-not-currently-broken pattern, corrected for robustness
  while already there).
- **`PlatformMockup.tsx`** — same `text-paper` → `text-modus-foreground`
  fix on one small accent badge.
- Swept the whole codebase for both patterns afterward and found the
  `text-paper`-on-`bg-modus` pattern is genuinely **site-wide** (dozens of
  files — every existing accent-colored button) and numerically harmless
  in every case checked (paper and modus-foreground happen to share
  identical values in both themes, by original design). Per the explicit
  "do not broaden this into a site-wide unrelated cleanup" instruction,
  left untouched everywhere else. The `bg-ink/NN`-as-scrim pattern was
  also found in a handful of `/app`- and `/diagnostic`-interior files
  (`CommandMenu.tsx`, `ModusBriefing.tsx`, `Drawer.tsx`, `StatusBadge.tsx`,
  `WarpDetail.tsx`) — out of this checkpoint's scope (Section 25/19),
  left flagged, not fixed.
- **Targeted theme verification, live**: `ClientAuthOverlay`'s backdrop
  measured `rgba(21, 23, 22, 0.3)` in both light and dark site theme
  (fixed, correct); its submit button measured `bg(18,60,45)/text(250,250,248)`
  in light mode and `bg(47,158,118)/text(21,23,22)` in dark mode — both
  exactly matching the Checkpoint 1 contrast-computed accent pairs.

### Section 1 — content principle

Unchanged proposition, same real MODUS copy throughout (see "content
preservation" below) — OBSERVE → DIAGNOSE → PRIORITIZE → IMPLEMENT →
MEASURE → IMPROVE is now the homepage's own signature section (Section 8),
not just mentioned in passing.

### Section 2 — primary conversion rule

Free Diagnostic present in nav (unchanged, Checkpoint 3), hero (primary
CTA), diagnostic-entry section (its own dedicated mid-page section), and
final CTA — four placements, all through the one canonical
`DiagnosticCTA` component, all rendering the same real label
("Run a Diagnostic," `dict.nav.runDiagnostic`) via the same
`useCustomerContext()` personalization. Chatbot/cases/pricing all kept
strictly secondary — verified live: the "Talk to MODUS" trigger never
appears styled as a primary action anywhere, pricing's own CTA is a plain
text link.

### Section 3 — hero

`Hero.tsx` rewritten. Real existing copy kept exactly (`dict.home.hero`,
untouched strings — "We improve how businesses work." already reads close
to the brief's own suggested direction, so it wasn't replaced, per Section
24). Headline promoted from `display-md`/`display-lg` to
`display-lg`/`display-xl` (Checkpoint 1's largest fluid token, unused
anywhere until now) — the single biggest typographic change on the page.
New `processLabel` micro-line added ("Observe · Diagnose · Implement ·
Measure"). Primary CTA now goes through `DiagnosticCTA`, picking up
personalization for free. **`HeroOrbitalSystem` (the ~700-line "living
instrument" diagram) was kept, not rebuilt or removed** — a deliberate
decision: it's a genuine signature piece from earlier in this project, not
a "UI card," and removing ~700 lines of tuned polar geometry/parallax to
satisfy "avoid filling the hero with UI cards" would have been solving the
wrong problem (the brief's own complaint is about AI-SaaS-template feature
cards, not a bespoke instrument diagram). Given more breathing room
instead via the larger type scale.

### Section 4 — fluid field tuning

Not re-tuned this checkpoint beyond what Checkpoint 3 already restrained
it to (7% opacity, full-viewport, behind all content) — mounted once in
the marketing layout, so it's already "integrated" with the hero by
virtue of sitting directly behind it; no hero-specific intensity change
was made. Flagged as a decision needing approval below, since Section 4
explicitly invited "may now become more visually expressive."

### Section 5 — dark/light composition

The homepage's own section rhythm, top to bottom: paper (Hero) → paper
(Problem) → mineral (Diagnostic entry) → **inverted, always-dark**
(Process — the one deliberately "near-black" section) → surface (What
MODUS Sees) → paper (Business X-Ray) → paper (Capabilities) → paper
(Cases) → paper (Platform) → paper (Pricing) → **modus, accent-dominant**
(Final CTA) → **inverted, always-dark** (Footer). Two genuinely inverted
moments (Process, Footer) bracket a long light stretch, rather than
mechanically alternating every section — the "choreographed, not
mechanical" instruction from Section 5.

### Section 6 — diagnostic-entry interaction

New `DiagnosticEntry.tsx`. A real, interactive input + 5 category toggle
chips + `DiagnosticCTA`, **not wired into the diagnostic state machine**
— a deliberate choice, not a shortcut, explained in the component's own
comment: writing into `DiagnosticShell`'s `sessionStorage` key before
navigating would incorrectly trigger its existing "resume a saved draft?"
recovery prompt (that prompt fires for *any* non-empty saved state, not
just a genuine resumed session), and adding new state-machine plumbing to
accept a category param was outside this checkpoint's mandate. This is
exactly the brief's own explicitly-sanctioned fallback ("if it would
require risky business-logic changes, keep this as a visual entry
interaction that routes to `/diagnostic`"), not a corner cut silently.
Verified live: typing text, toggling a chip on/off, and submitting all
work, and the diagnostic starts genuinely fresh afterward (no spurious
resume prompt).

### Section 7 — problem section

`CentralInsight.tsx` — **left untouched**. On inspection it already does
exactly what Section 7 asks for (oversized two-line contrasting statement,
real MODUS copy, no cards/icon-grid) — rewriting a section that already
satisfies the brief's own stated goal would have been change for its own
sake. Its real copy ("Most businesses don't need more software. / They
need to understand what is actually slowing them down.") is unchanged.

### Section 8 — MODUS Process, the signature section

New `ModusProcessSection.tsx`, built on Checkpoint 2's `usePinnedSequence`
(no new animation architecture). Six stages, one dominant at a time, all
six DOM nodes present from the start (morphing via opacity/position
changes on the same nodes, not six cards mounting in sequence) — a left
index rail tracks progress with a filling vertical line. Canonical labels
(OBSERVE/DIAGNOSE/PRIORITIZE/IMPLEMENT/MEASURE/IMPROVE) used deliberately,
differing slightly from `/how-it-works`' existing "Observe/Understand/
Prioritize/Intervene/Measure/Improve" wording — that page's interior is
untouched this checkpoint (Section 25), and this checkpoint's own brief
names the six stages explicitly by these exact words, so the homepage
uses them; flagged as a real, deliberate terminology variance to resolve
later, not an inconsistency introduced by accident.

**A real visual bug was found and fixed** — see "Bugs discovered/fixed"
below: the original implementation dimmed outgoing panels to 25% opacity
instead of 0%, and because all six panels are absolutely positioned on
top of each other (intentionally, for the morph), a merely-dimmed
outgoing panel's differently-sized text visibly ghosted through the
incoming one. Fixed; verified via a fully-settled (non-scrolling)
screenshot showing exactly one clean, legible stage with zero ghosting.

**Consolidates `ModusExperience.tsx`** (the previous "We listen / observe
/ intervene / stay" four-stage section) — same underlying story, now told
once at the brief's own six-stage canonical resolution instead of a
shorter version existing alongside it. `ModusExperience.tsx` is not
imported by the new homepage; the file itself is kept, not deleted (see
"content preservation" below).

### Section 9 — What MODUS Sees

`WhatModusSees.tsx` evolves the previous `Philosophy.tsx` — identical real
copy (`dict.home.philosophy`, unchanged: the four symptom → real-cause
pairs, e.g. "A customer service problem" → "may actually be a workflow
problem"), same section label text ("Philosophy," kept as real existing
content rather than invented). Each pair now gets its own GSAP reveal
(`useGsapReveal`, Checkpoint 2) with a small arrow marking the
resolve-to-insight moment, for rhythm variety against the page's
Motion-based reveals elsewhere — the "intelligence feel without literally
embedding a dashboard" the brief asks for. `Philosophy.tsx` itself is not
imported by the new homepage; the file is kept, not deleted.

### Section 10 — solutions/capabilities

New `CapabilitiesPreview.tsx`, deliberately minimal per the brief's own
instruction not to build a generic six-card icon grid: a plain, text-led
list of the five real capability groups already defined for the actual
`/capabilities` page (`dict.capabilities.groups` — reused verbatim, no new
copy invented), linking to that page. No spatial/draggable interaction —
judged not to improve comprehension enough to justify the engineering
risk for five short text rows, per the brief's own "only if it improves
comprehension" qualifier.

### Section 11/12 — cases preview, image reveals

`CasesPreview.tsx` evolves `ProofSection.tsx` — identical real copy and
metrics (`dict.home.proofSection`, including the explicit "Illustrative
example" context line, kept honest, not removed), now inside a
`MediaFrame` with the Checkpoint 2 `useImageReveal` GSAP hook (clip-path
wipe + scale settle) and `NumberTicker` count-up on the three metrics
(reused existing primitive, not rebuilt). `bg-white` → `bg-paper` fixed
along the way (a pre-existing token bypass this rewrite naturally
touched). **A second real bug was found and fixed here** — see below.
`ProofSection.tsx` itself is kept, not deleted, not imported by the new
homepage.

### Section 13 — stats

`NumberTicker` count-up applied only to the Cases preview's three real,
already-illustrative metrics (78% / 26% / €42K+) — no new statistics
invented, nothing else on the page animates a number, per "only where
meaningful."

### Section 14 — technology/platform preview

`PlatformTeaser.tsx` and `PlatformMockup.tsx` — **left unchanged**
structurally (still shows the real tabbed Signals/Improvements/
Performance/Systems/Ask-MODUS mockup, a signature piece). One real bug
fixed inside `PlatformMockup.tsx` — see below.

### Section 15 — pricing preview

New `PricingPreview.tsx` — the three real MODUS plans (Essential €200,
Intelligence €750, Growth €1,000 per month, all `/month`), not a copy of
the reference's pricing structure. Deliberately calmer than the hero/
process sections (plain bordered cards, no accent fill), matching the
brief's own instruction. Advertising-spend-separate noted in the body
copy, consistent with the commercial model established throughout this
project.

### Section 16 — final CTA

`FinalCTA.tsx` rewritten — real existing copy kept exactly
(`dict.finalCTA`: "What would MODUS find in your business?" already reads
almost verbatim like the brief's own suggested direction, so it wasn't
replaced). Oversized centered `display-lg` headline, `bg-modus` accent
field, the primary CTA routed through a **new `DiagnosticCTA` variant**
(`accent-invert`) — see "bugs discovered/fixed" below for why the
existing `footer` variant would have been the wrong choice here.

### Section 17/18 — scroll choreography, Lenis/GSAP

No new one-off animation architecture — every new section reuses
Checkpoint 2's primitives (`usePinnedSequence`, `useGsapReveal`,
`useImageReveal`) or Motion's existing `Reveal`/`TextReveal`. Verified
live: repeated navigate-away-and-back cycles produce zero console errors
(no duplicate ScrollTriggers/RAF loops), anchor navigation (clicking the
logo to return home from another page) works, and scrolling the full
homepage top-to-bottom (60 wheel ticks) produces zero console errors.

### Section 19 — nav relationship

Not touched beyond what Checkpoint 3 already built — no new hero-state-
aware nav tuning was added this checkpoint (the existing scroll-reactive
height/blur already responds to scroll position). Flagged as deferred
below, since Section 19 explicitly invited subtle adaptation.

### Section 20 — light/dark

Both themes designed and verified live at every major state: hero
(screenshotted, both themes, laptop), diagnostic entry, process section
(settled state, both themes via the theme-token fixes), cases (metrics
settle correctly in both), pricing, final CTA, footer transition. The
token-inversion fixes (pre-work, above) are precisely what make this
honest rather than "looks fine in light, assumed fine in dark."

### Section 21 — responsive

Mobile hero screenshotted (both themes) — `HeroOrbitalSystem` naturally
stacks below the text column rather than competing for the fold (single-
column grid, no forced side-by-side squeeze). Process section's pinned
sequence remains active on mobile (not simplified away) since `h-screen`
+ pin degrades acceptably at narrow widths — verified live: zero overflow,
zero console errors scrolling the full page at 390px. **A real, serious
mobile overflow bug was found and fixed** — see below; the official
project regression test (`responsive.spec.ts`, home @ mobile) is the
actual reproduction case that caught it.

### Section 22 — reduced motion

Every new section respects it, verified live, not assumed: Process
section renders all six stages stacked in normal flow with zero pinning;
fluid field mounts zero `<canvas>` elements; page-transition crossfade
(Checkpoint 3) renders children directly. A dedicated Playwright check
confirms all six stage headings are present without any scrolling under
`prefers-reduced-motion: reduce`.

### Section 23 — performance

| Metric | Checkpoint 3 | Checkpoint 4 |
|---|---|---|
| `.next/static/chunks` | 3.4MB | 3.5MB |
| Homepage JS (network-measured) | 1446KB / 18 files | 1459KB / 18 files |
| `/app` gsap/Lenis present? | No | No (re-verified) |

+13KB for the entire homepage redesign (new sections, no new
dependencies — everything reuses Checkpoint 1/2/3 infrastructure). File
count unchanged (18) — no new route-level chunk was introduced; the new
homepage sections are part of the same page bundle as before, not
separately code-split (none of them are heavy enough on their own to
justify a dynamic import boundary beyond what the fluid field already
has).

### Content preservation (Section 24) — what changed, what didn't

**Untouched, still imported and rendered on the homepage:**
`CentralInsight.tsx`, `BusinessXRaySection.tsx` (and `BusinessXRay.tsx`
itself — the flagship 9-step diagram, not touched at all),
`PlatformTeaser.tsx` (content/structure; `PlatformMockup.tsx` got one
real bug fix, see below), `FooterReveal.tsx`, `Footer.tsx` (Checkpoint 3).

**Evolved in place (same real copy, new file, richer treatment):**
`Philosophy.tsx` → `WhatModusSees.tsx`; `ProofSection.tsx` →
`CasesPreview.tsx`.

**Rewritten (same real copy where it existed, new visual treatment):**
`Hero.tsx`, `FinalCTA.tsx`.

**New (no prior homepage equivalent):** `DiagnosticEntry.tsx`,
`ModusProcessSection.tsx` (though it absorbs `ModusExperience.tsx`'s
story), `CapabilitiesPreview.tsx` (reuses real `/capabilities` copy),
`PricingPreview.tsx` (reuses real pricing data already established
project-wide).

**Retired from the homepage, files kept not deleted** (no project-scoped
git history to recover them from if this turns out wrong — flagged once
already earlier in this project, repeating the same caution here):
`ModusExperience.tsx` (superseded by `ModusProcessSection.tsx`'s fuller
six-stage version of the same story), `EngagementTeaser.tsx` (superseded
by `PricingPreview.tsx`, which shows real plan pricing instead of just a
loop label + a link). Neither is imported by any other page (checked via
grep before retiring either).

**No MODUS copy was replaced with reference copy anywhere** — every
section's real existing strings were kept; only genuinely new sections
(diagnostic-entry, process stage bodies, pricing preview, capabilities
preview) needed new copy, and all of it was either reused verbatim from
elsewhere in the existing dictionary or written fresh in the same
restrained, technical MODUS voice.

### Section 25 — other page interiors

Confirmed untouched via `git`-less but still verifiable means: grepped
every file changed this checkpoint against the route list — only
`(marketing)/page.tsx` and its newly-introduced section components
changed; `/how-it-works`, `/platform`, `/pricing`, `/capabilities`,
`/results`, `/company`, `/diagnostic` page files themselves are
byte-identical to their Checkpoint 3 state. The two shared-component bug
fixes (`PlatformMockup.tsx`, `MediaFrame.tsx`/`DiagnosticCTA.tsx`) are
real bug fixes in components other pages also use, not redesigns of those
pages' content — verified `/platform` itself still renders correctly
afterward (full regression suite passing, including its own responsive
checks).

### Bugs discovered and fixed (all verified live, all chased to a specific confirmed cause)

**1. Process section panel ghosting.** See Section 8 above. Fixed by
changing outgoing panels from 25% to 0% opacity (a clean crossfade, with
a small directional y-drift added for the "carry-over motion" quality
instead).

**2. The real mobile overflow bug — the significant one, and a genuine
investigation dead-end before the real cause.** The project's own trusted
`responsive.spec.ts` (`home @ mobile`) failed with a real 522px-at-390px
overflow. First investigation attempt used `getBoundingClientRect()` to
find "the widest element" and landed on `PlatformMockup.tsx`'s tab nav
row — a plausible-looking but **wrong** diagnosis, because
`getBoundingClientRect()` doesn't account for ancestor clipping: that
nav's `overflow-x-auto` was already correctly containing its own wide
content, and a `min-w-0` defensive fix applied there (kept, since it's
still good practice for that CSS pattern, but honestly re-documented as
not the actual fix) changed nothing. Rebuilt the overflow-detector to
correctly exclude elements with a clipping ancestor, which found the
**real** cause: `MediaFrame.tsx` (used by this checkpoint's own new
`CasesPreview.tsx`) combined `aspect-video` with `h-full` and no `w-full`
— letting the browser compute width freely from `aspect-ratio × height`
instead of from the actual available column width, producing a ~498px-
wide box inside a ~340px column, made worse by the GSAP reveal's initial
`scale(1.08)` state. Fixed two ways: `MediaFrame.tsx` now always includes
`w-full` in its base class (so `aspect-*` always derives from a properly
constrained width, for every future consumer of this Checkpoint 3
primitive, not just this one); `CasesPreview.tsx`'s usage changed from
unconditional `h-full` to `lg:h-full` (mobile lets `aspect-video` alone
derive height from the now-correct width; desktop's explicit grid-stretch
height coexists fine with `aspect-video` since both dimensions are
explicit there). Verified: the exact official regression test now
passes, and a corrected ancestor-aware overflow scan of the full homepage
returns zero results.

**3. `FinalCTA`'s CTA button using the wrong `DiagnosticCTA` variant.**
Caught before shipping, not after: the existing `footer` variant (fixed
`inverted-foreground` text, built for the always-dark footer) would have
stayed near-white even in dark site theme on `FinalCTA`'s `bg-modus`
section — exactly backwards, since `bg-modus` turns *brighter* in dark
mode and needs *dark* text for contrast, not fixed light text. Added a
new `accent-invert` variant instead (`bg-paper`/`text-ink`, both
theme-relative, which — unlike the fixed-inverted tokens — correctly
produces a light pill in light mode and a dark pill in dark mode, always
contrasting against whichever shade of green `bg-modus` currently
resolves to). A real design-system gap found by building real content
against it, not a hypothetical.

### Files added

`src/components/sections/{DiagnosticEntry,ModusProcessSection,WhatModusSees,CapabilitiesPreview,CasesPreview,PricingPreview}.tsx`.

### Files changed

`src/components/sections/{Hero,CentralInsight*,FinalCTA,PlatformMockup}.tsx`
(*CentralInsight.tsx listed only because it was inspected, not modified —
see Section 7), `src/components/ui/{DiagnosticCTA,MediaFrame,SectionLabel}.tsx`,
`src/components/client/ClientAuthOverlay.tsx`, `src/app/(marketing)/page.tsx`,
`src/lib/i18n/dictionaries/{en,nl}.ts` (new `diagnosticEntry`/`process`/
`pricingPreview` keys, `hero.processLabel` added; one dead field —
`diagnosticEntry.cta`, added then found unused since `DiagnosticCTA`
always renders its own canonical label — removed again the same session
before shipping, not left as cruft).

### Files NOT changed (despite being imported by the retiring sections'
replacements or otherwise touched in spirit)

`Philosophy.tsx`, `ProofSection.tsx`, `ModusExperience.tsx`,
`EngagementTeaser.tsx`, `BusinessXRay.tsx`, `BusinessXRaySection.tsx`,
`PlatformTeaser.tsx` (content), `PlatformMockup.tsx` (structure — only
the one-line bug fix), `FooterReveal.tsx`, `Footer.tsx`.

### Tests performed

`tsc`/`eslint`/`build` clean throughout (checked after every major
change, not just at the end). `vitest` 22/22. Full Playwright regression:
38/39 (1 pre-existing intentional skip). A dedicated 18-test Checkpoint-4
spec (deleted after use, per convention) covering every item in Section
27's own list: hero content, HeroOrbitalSystem preserved, diagnostic CTA
routing, diagnostic-entry interaction (chip toggle, text input, safe
routing, no spurious resume prompt), process section (all six labels
present, reduced-motion fallback), full-page scroll with zero console
errors, repeated navigation with zero console errors, anchor navigation,
theme (dark mode body color, mid-scroll theme switch with zero errors),
mobile (zero overflow after the real fix, CTA reachable), WebGL (canvas
present/absent correctly under reduced motion), footer transition
(reachable, CTA present), an explicit `/diagnostic` smoke re-check, and
an explicit `/app` isolation re-check (zero marketing chrome/canvas/
footer, auth flow intact).

### Visual observations (per Section 28 — states actually inspected, not just described)

Screenshotted and read, not just executed against: hero at 1920×1080,
1440×900, 768×1024, 390×844, each in both light and dark (8 screenshots);
the Problem section and Diagnostic entry card (laptop, light); the
Process section at three points — entry, mid-pin, and a fully-settled
frame confirming the ghosting fix (laptop, light and dark); Cases preview
after metrics settle, confirming real final values (78%/26%/€42K+) and
the MediaFrame's corner label rendering correctly after the redundancy
fix; Pricing preview (three real plan cards); Final CTA via its own
`#final-cta` anchor (confirmed oversized centered headline, the new
`accent-invert` button, footnote); Footer immediately below it (confirmed
still correctly fixed-dark per Checkpoint 3). Mobile dark-mode hero
separately confirmed clean.

### Known limitations

- The fluid field's intensity/composition is unchanged from Checkpoint
  3's restrained 7% baseline — Section 4 invited it to "become more
  expressive" for the hero specifically; not done this checkpoint, see
  decisions below.
- Nav's own hero/section-state-aware adaptation (Section 19) wasn't
  extended beyond Checkpoint 3's existing scroll-reactive behavior.
- No dedicated GPU/frame-rate profiling was performed with the homepage's
  full real content weight now in place (Checkpoint 2/3 both flagged this
  as appropriately deferred until real-page integration — this checkpoint
  is that integration, so it's now genuinely due).
- The Process section's canonical stage labels (OBSERVE/DIAGNOSE/
  PRIORITIZE/IMPLEMENT/MEASURE/IMPROVE) differ slightly from
  `/how-it-works`' existing wording (Observe/Understand/Prioritize/
  Intervene/Measure/Improve) — a deliberate, documented choice (Section 8
  above), not fixed to match since that page's interior is out of scope.
- `ModusExperience.tsx`/`EngagementTeaser.tsx`/`Philosophy.tsx`/
  `ProofSection.tsx` are now dead code (not imported anywhere) but not
  deleted — a deliberate, conservative choice given no project-scoped git
  history exists to recover them from if that turns out to be wrong.

### Anything intentionally deferred

Fluid-field hero-specific intensity tuning, nav hero-state awareness, GPU
profiling, resolving the Process/`how-it-works` terminology variance,
deleting the four now-dead-code files (kept as a reversible, low-cost
safety margin rather than committed to now).

### Decisions requiring approval before Checkpoint 5

1. **Fluid field intensity for the hero specifically.** Section 4
   explicitly invited more expressiveness; this checkpoint kept
   Checkpoint 3's flat, restrained 7% baseline everywhere including the
   hero. Recommend a small, hero-scoped intensity increase (e.g., a
   slightly higher opacity or radius only while the pointer is within the
   hero's own bounds) as a Checkpoint 5 task, tested carefully against
   readability per Section 4's own caution, rather than done
   speculatively now.
2. **Delete vs. keep the four dead-code files.** Recommend keeping them
   for now (zero cost, real safety margin) and revisiting once the
   redesign as a whole is closer to final — deleting is a one-way action
   in this git-less project directory.
3. **Process section terminology vs. `/how-it-works`.** Recommend
   updating `/how-it-works`' own wording to match the homepage's
   canonical six words when that page's interior is eventually touched,
   rather than changing the homepage to match the older wording.
4. **GPU/frame-rate profiling.** Recommend doing this now, before
   Checkpoint 5 adds any further visual weight, using a real profiler
   (Playwright alone can't measure this) — flagged as genuinely due, not
   just noted again.
5. **Nav hero-state awareness** (Section 19) — recommend deciding whether
   this is still wanted given the nav already reads clearly against every
   section's background in the screenshots reviewed, or whether it's
   better spent effort elsewhere.

### Recommended next checkpoint

**Checkpoint 5 — Diagnostic**, per the approved plan (visual-only,
Section 27 of the master brief's own instruction: zero functional change
to the diagnostic's state machine, validation, or submission contract).
Awaiting go-ahead.

---

## Checkpoint 3 — Global Shell (2026-09-30)

**Status: complete. Stopped for approval, per instruction.** Homepage
content untouched (Section 18/26 respected — same interior sections,
same copy, same layout, just now sitting inside the new shell). `/app`
confirmed to get shared theme tokens only, nothing else. Three real bugs
were found and fixed during this checkpoint, not assumed correct from the
design — details below, each verified live before being called done.

### R3F removal (Section 21) — done first, before the shell work

Per the approved decision: deleted `FluidFieldR3F.tsx`, simplified
`FluidFieldDemo.tsx` back to a single raw-WebGL2 panel (no more toggle),
uninstalled `@react-three/fiber`, `three`, `@types/three`. Verified via
`npm ls` (empty) and by grepping the compiled production bundle for
`THREE\.` signatures — zero matches anywhere, confirmed clean. Checkpoint
2's full comparison table, measured numbers, and the "raw WebGL2"
recommendation are preserved untouched in that entry above — this
section only records the removal, not a re-litigation of the decision.

### Section 1 — `(marketing)` route group: done, URLs verified unchanged

All 8 marketing pages moved: `src/app/page.tsx` →
`src/app/(marketing)/page.tsx`, and the same for `how-it-works`,
`platform`, `capabilities`, `results`, `company`, `pricing`,
`diagnostic`. `/app`, `/private`, `/proposal/[token]`, `/api/*` — plus
`/design-system` and `/motion-lab`, both deliberately kept **outside**
the group (see Section 22 below) — were not moved. Verified two ways: (1)
`next build`'s own route table before and after the migration is
byte-for-byte identical (`/`, `/capabilities`, `/company`, `/diagnostic`,
`/how-it-works`, `/platform`, `/pricing`, `/results` — no `/marketing`
prefix anywhere); (2) a live Playwright pass hitting every one of those
8 URLs directly (hard refresh) plus client-side navigation, browser
back/forward, all confirmed working. Only files moved this checkpoint —
each `page.tsx`'s own content (imports aside, see next section) is
unchanged.

### Section 2 — Marketing-only layout: `src/app/(marketing)/layout.tsx`

New file. Renders `Loader` → `MarketingFluidField` → `Navigation` →
`PageTransition(children)` → `Chatbot` → `LanguagePrompt`, wrapped in
`LenisProvider`. Every one of the 8 moved pages had its own per-page
`<Navigation />` import/render removed (was 100% duplicated across all 8
— confirmed by grep before removing) since the layout now renders it
once. Architecture matches the approved "shared foundation, separate
expression" rule exactly:

```
ROOT (src/app/layout.tsx)
  theme + locale + consent — shared, reaches /app and /private too
    ↓
MARKETING LAYOUT (src/app/(marketing)/layout.tsx)
  Lenis, the WebGL fluid field, page transitions, marketing nav/footer
    ↓
/app, /private — structurally outside this layout entirely,
  inherit shared tokens from root, nothing else
```

### Section 3 — The pre-existing overlay leak: fixed architecturally

Checkpoint 0's audit found `Chatbot`/`LanguagePrompt`/`ConsentBanner`/
`Loader` all mounted at root and only excluded `/private` via a pathname
check — meaning they could (and did) render on top of `/app`. Resolved
per the brief's own preference ("correct architecturally rather than
fragile pathname checks"):

- **Moved to the marketing layout** (structurally impossible to reach
  `/app`/`/private` now, no pathname check left to forget): `Chatbot`,
  `LanguagePrompt`, `Loader`.
- **Stayed at root, documented why** (see `src/app/layout.tsx`'s own
  comment): `ConsentBanner`. It's legitimately global, not marketing-only
  — the cookies it governs consent for (`modus_theme`, `modus_locale`,
  any future analytics cookie) are set site-wide including on `/app`, and
  a visitor of the client dashboard is still a visitor whose consent
  matters. It already excludes `/private` via its own pathname check
  (unchanged) since that surface has no external visitors at all.

Verified live: `/app/overview` (signed in) has zero marketing nav
elements, zero footer, zero Lenis/gsap/three code in its network
requests (see Performance section), zero `<canvas>` elements, and its own
auth flow (login → OTP → overview) still works end to end.

### Navigation (Sections 4–7)

`Navigation.tsx` rewritten — same 6 links, same `useCustomerContext()`
personalization, restyled: quiet/transparent at rest, existing
scroll-reactive height/blur mechanism kept (just retimed alongside the
new elements), restrained active-state treatment, `ThemeSwitch` given a
real placement (`xl:` breakpoint, next to `LanguageSwitch`/
`ClientUserButton`), and the primary CTA now goes through the new
canonical `DiagnosticCTA` component (magnetic on desktop, same
`MagneticButton` primitive already used elsewhere). No Kraft-derived
navigation patterns — same MODUS information architecture as before,
restyled through the Checkpoint 1 token system.

**A real, load-bearing bug was found and fixed in `Navigation.tsx`
itself** — see "Real bugs found" below; it directly gates whether Section
6's mobile nav requirement ("no background interaction while open") is
actually true.

### Mobile navigation (Section 6): `MarketingMobileNav.tsx`, new

Genuinely separate design, not a shrunk dropdown: full-screen panel,
large editorial link typography (32px), staggered entrance
(`staggerChildren`), theme switch + language switch + client auth +
`DiagnosticCTA` in the footer area. Accessibility built explicitly, each
one verified live via Playwright, not assumed:
- Scroll lock (`document.body.style.overflow = "hidden"` while open,
  restored on close).
- Escape closes it.
- A real Tab/Shift+Tab focus trap between the panel's first and last
  focusable elements.
- Focus moves to the close button on open, returns to the trigger button
  on close (a captured `triggerEl` reference, not a stale ref read in the
  cleanup — a `react-hooks/exhaustive-deps` warning caught this during
  lint, fixed before it shipped).
- Touch-friatendly targets (44px close button, full-row 44px+ link
  targets).

### Theme switch integration (Section 7)

No second theme implementation — both `Navigation`'s desktop control and
`MarketingMobileNav`'s panel control are the same `ThemeSwitch` component
built in Checkpoint 1, consuming the same root `ThemeProvider`/
`useTheme()`. Verified live: switching theme from the nav persists across
client-side navigation to another marketing page (`data-theme` on
`<html>` unchanged across the route change, no flash).

### Marketing motion scoping (Section 8) and fluid field (Section 9)

`LenisProvider` and `MarketingFluidField` now mount for real, for the
first time, inside `(marketing)/layout.tsx` — previously only proven on
the isolated `/motion-lab` test surface. `MarketingFluidField.tsx` (new,
`src/components/motion/`) wraps the proven raw-WebGL2 field at **7%
opacity**, `pointer-events: none`, fixed behind all content
(`-z-10`) — deliberately restrained, matching the brief's own framing
("the system is present and correct" this checkpoint, not "the final
hero effect is finished," which is Checkpoint 4's job). Every lifecycle
property already proven on `/motion-lab` in Checkpoint 2 (reduced-motion
skip, coarse-pointer skip, theme-aware colors, visibility pause, resize,
full `dispose()` cleanup) carries over unchanged — same component, not a
reimplementation. Verified live: `/`'s network requests include gsap+
Lenis (48KB gzipped) and zero three.js; `/app`'s and `/private`'s include
neither.

**Where the reusable fluid-field code lives changed this checkpoint**:
`FluidFieldRawGL.tsx` moved from `src/components/motion-lab/` (internal
test-only) to `src/components/motion/` (shared, production-usable) — per
Section 22's own instruction not to let lab code leak into production or
vice versa. `motion-lab/FluidFieldDemo.tsx` now imports it from the new
location; `/motion-lab` itself was verified still fully functional after
the move (live Playwright check: canvas renders, zero console errors).

### Page transition foundation (Section 10): `PageTransition.tsx`, new

A short (0.2s) opacity+blur crossfade keyed by `usePathname()`, mounted
around `{children}` in the marketing layout. Deliberately not
`mode="wait"` (this project's own documented reason that pattern is
avoided project-wide — the confirmed root cause of a real "content stuck
invisible" bug earlier in this project's history if the exit/enter
handoff ever stalls). Reduced motion: children render directly, no
wrapping motion element created at all. Verified live: browser back/
forward and direct navigation all update correctly (`usePathname()`
covers all three without special-casing), navigating between 4 marketing
pages in sequence produces zero console errors, and reduced-motion
mode still renders real content (not stuck blank).

### Footer redesign (Section 11)

`Footer.tsx` restyled — oversized wordmark (existing `size="xl"` Logo,
kept), the existing sticky `FooterReveal`/`FinalCTA` composition
preserved exactly (explicitly out of scope per Section 11 — "this is the
reusable footer," not the CTA section), Free Diagnostic now goes through
`DiagnosticCTA`'s new `"footer"` variant (a plain text link matching the
column's existing list style, not a second competing button next to
"Talk to MODUS"). Identity, nav, get-started column, privacy/legal links,
language switch, and the live status line are all preserved.

**A real, systemic bug was found and fixed while doing this — see below.**

### Real bugs found and fixed this checkpoint (all verified live, not assumed)

**1. The token-inversion bug — the significant one.** Checking the
footer's rendered colors under a dark *site* theme (not just visually
inspecting the source) showed its background had become
`rgb(250, 250, 248)` (light) and its text `rgb(21, 23, 22)` (dark) — a
complete inversion of the intended always-dark footer. Root cause: before
Checkpoint 1, `bg-ink text-paper` was safe for "always dark" sections
because `ink`/`paper` were flat, non-theme-reactive hex. Checkpoint 1
correctly made them *theme-relative* for body content (which is exactly
what body content needs), but nothing in that checkpoint's own testing
caught that this silently breaks every *pre-existing* "intentionally
inverted" section — under a dark site theme, dark-mode's `ink` is
near-white and `paper` is near-black, exactly backwards for a section
meant to stay dark. This is a real gap in Checkpoint 1's own verification
(it checked `body`/`bg-mineral` computed colors, not these inverted
sections), surfaced only now while touching the footer for real.

Fixed with new **fixed, non-theme-reactive tokens**:
`--surface-inverted` / `--surface-inverted-foreground` (`globals.css`,
defined once in `:root`, deliberately **not** redefined in either
dark-mode block — see that file's own long comment), exposed as
`bg-inverted` / `text-inverted-foreground` in `tailwind.config.ts`.
Verified live under both site themes: footer background is
`rgb(21, 23, 22)` regardless of light or dark site theme, exactly as
intended.

**Scope of the fix — bounded deliberately, not swept wide.** Converted
every direct dependency the Footer redesign actually touches:
`Footer.tsx` itself, `Logo.tsx`'s `Wordmark`/`Tagline`/alt-caption
"light" tone (three separate spots, all found by grepping this one
component once the pattern was understood), `LanguageSwitch.tsx`'s
`tone="light"` branch (the footer's own language control), `Loader.tsx`
(same always-dark curtain problem, see its own entry below),
`Chatbot.tsx`'s mobile backdrop scrim, `ConsentPreferencesDialog.tsx`'s
backdrop scrim, and the `text-paper` → `text-modus-foreground` correction
on 3 accent-colored buttons (`ConsentBanner`, `ConsentPreferencesDialog`,
`LanguagePrompt`) — those happened to be numerically identical to the
already-correct `modus-foreground` token today (both values were chosen
to match, coincidentally), not a visible bug, but a fragile coincidence
worth naming correctly while already there. **Not fixed, flagged
instead**: every other pre-existing "always-dark" component this
checkpoint doesn't otherwise touch (`Philosophy.tsx`, `ClientAuthOverlay.tsx`,
`PlatformPanels.tsx`'s dark sections, the diagnostic's own dark UI if
any) almost certainly has the identical latent bug — a real, concrete
punch list for whenever each is next touched, not silently patched
site-wide in a checkpoint scoped to the global shell.

**2. The mobile-nav containing-block bug.** Opening the mobile menu
visually showed page content bleeding through behind the nav links, and
the consent banner still interactable at the bottom — directly violating
Section 6's "no background interaction while open" requirement. Chased
via `getBoundingClientRect()` rather than guessed from the screenshot
alone: the panel's actual box was `{width: 390, height: 80}` — not the
viewport, `{390, 844}` — despite every CSS inset value correctly
computing to `0px`. Root cause: `<header>` gets `backdrop-blur-sm` (a
`backdrop-filter`) applied whenever `mobileOpen` is true, and per the CSS
spec, `backdrop-filter` — like `transform` or `filter` — creates a new
**containing block** for any `position: fixed` descendant. With
`MarketingMobileNav` nested inside `<header>`, its own `fixed inset-0`
resolved against `<header>`'s ~80px height instead of the viewport.
Fixed by moving `MarketingMobileNav` to be a sibling of `<header>`
instead of a child (`Navigation.tsx` now returns a fragment, not
`<header>` as its root element). Verified live: panel box is now exactly
`{390, 844}`, screenshot confirms a clean full-screen menu with no
bleed-through, all 4 mobile-nav accessibility tests plus the
"no-background-interaction" implication pass.

**3. The hold-to-submit pointer-capture bug — found while re-running the
pre-existing regression suite, not new test-writing.** One existing
diagnostic test (`the 'what goes wrong' free-text field is optional`)
started failing consistently, including in complete isolation with zero
parallel load — ruled out as flakiness early, then actually chased.
`getBoundingClientRect()` on the "Hold to Submit" button mid-hold showed
it had moved **30px vertically** during the 1.8s hold — traced to the
consent banner's own entrance animation landing during that window and
shifting page layout. `HoldToConfirm.tsx` cancelled the hold via
`onPointerLeave`, which fires when a *stationary* pointer ends up outside
a *moved* button's bounds — exactly what happened. Confirmed the causal
chain directly: with consent pre-accepted (banner never appears), the
button never moves and the hold succeeds every time. **This is a real
interaction robustness bug, not a test artifact** — any real visitor
whose held-down mouse gets "left behind" by ANY layout shift (a banner,
a late-loading image, an above-the-fold reflow) would silently lose their
hold-to-submit progress with no explanation, on the site's single most
important conversion action. Fixed with `setPointerCapture()` on
`pointerdown` — the standard DOM API for exactly this interaction class
(the same mechanism slider/drag controls use) — so the button keeps
receiving this pointer's events regardless of where it visually ends up,
until actually released. `onPointerLeave` removed, `onPointerCancel`
added for robustness. Verified: the previously-failing test now passes
reliably, including under repeated parallel-load runs.

### Consent / cookie UI (Section 12)

No change to consent semantics — `needsConsentDecision()`/
`saveConsent()`/`CONSENT_VERSION` untouched. Presentation already
inherited the Checkpoint 1 token system (same `SystemSurface` reveal,
`bg-paper`/`border-line`/mono-label language everything else uses) before
this checkpoint touched it, so the only real work here was the backdrop-
scrim and button-text token fixes above. Verified live: fresh user sees
the banner, "Accept All" dismisses it, a returning user with stored
consent does not see it again on reload — both real localStorage-backed
behaviors, not mocked.

### Loader (Section 13): kept, theme-token fixed, not otherwise rebuilt

Inspected before touching, per the instruction. Decision: **keep** — it's
a genuine brand moment (the MODUS mark confidently opening the site), not
a functional loading indicator masking real latency (content behind it is
already rendered; it unmounts on a fixed timeline, never tied to an
actual load state). Same real bug class as the footer:
`bg-ink`/`text-paper` would turn the reveal curtain **white** under a
dark site theme. Fixed using the same fixed `inverted`/
`inverted-foreground` tokens — a confident dark curtain regardless of
theme preference is the more coherent reading of "theme-aware" here (it
no longer breaks, rather than it now inverts), documented as a real
design decision in the component's own comment, not a silent default.
**Route transitions do not repeatedly show it** — verified this is
structurally true, not assumed: because `Loader` now mounts inside the
route-group *layout* rather than at root or per-page, Next does not
remount the layout on client-side navigation between marketing pages, so
the intro only plays once per full page load.

### Language prompt (Section 14): restyled token, i18n preserved

Only the `text-paper` → `text-inverted-foreground` linkage inside
`LanguageSwitch`'s "light" tone (used by the footer) needed a fix;
`LanguagePrompt.tsx` itself already used the token system correctly, just
had the `text-paper` button-text coincidence noted above. No changes to
`src/lib/i18n/`. Verified live: EN→NL switch still updates `<html lang>`
and content.

### Chatbot (Section 15): reviewed, kept as a secondary utility, not rebuilt

Confirmed against the actual component (not assumed): it's a floating,
secondary "Talk to MODUS" trigger with a compact panel — not a hero
interaction, doesn't replace the Diagnostic CTA anywhere, doesn't compete
visually with the primary nav/hero CTA. Already correctly scoped before
this checkpoint. The only change: it moved from root to the marketing
layout (Section 3's fix) and its mobile backdrop scrim got the same fixed
inverted-token fix as the footer/loader. No redesign performed — nothing
in Section 15 asked for one once the actual component turned out to
already satisfy every constraint listed.

### Shared marketing primitives (Section 16)

New, genuinely reusable, **not yet consumed by any real page** (that's
Checkpoint 4+ content work, per Section 18): `MarketingSection.tsx`
(surface + vertical-rhythm wrapper, consumes the Checkpoint 1 reserved
spacing tokens — `py-section-sm`/`py-section`/`py-section-lg` — for the
first time anywhere), `DisplayHeading.tsx` (wraps the fluid
`text-display-*` tokens with `Reveal`'s blur variant), `MediaFrame.tsx`
(restrained bordered media container, optional mono corner label).
Reused rather than duplicated: `Container`/`WideBleed` (container/
full-bleed), `SectionLabel` (technical label), `Button`/`DiagnosticCTA`
(primary/secondary CTA).

### DiagnosticCTA (Section 17): `src/components/ui/DiagnosticCTA.tsx`, new

The one canonical Free Diagnostic CTA for shell surfaces. Five variants
(`nav`/`hero`/`inline`/`dark`/`footer`) — only three consumed today
(`nav`, `hero`, `footer`); `inline`/`dark` are defined per the brief's own
named examples but not yet used, reserved for Checkpoint 4+ page content.
Every variant routes through the same `useCustomerContext()` next-best-
action system `Navigation.tsx` already used (Free Diagnostic → Continue
Diagnostic → View Proposal → View Profile, depending on visitor state) —
never a second, competing implementation. Every existing hardcoded
`href="/diagnostic"` elsewhere (Hero, FinalCTA, PricingHero,
PricingEstimateCTA, HomeContextBanner) is **untouched** — each already
has its own established personalization wiring, and this checkpoint's
job was the new shell surfaces, not auditing every existing CTA site.
Also centralizes `track("diagnostic_click", { source })` — the
established convention every other diagnostic CTA in the codebase already
follows — so the 3 new call sites (`nav`, `mobile_nav`, `footer`) get
consistent analytics without each one having to remember to wire it.

### `/app` verification (Section 19)

Explicitly confirmed live, not assumed from "we didn't touch it": no
marketing nav link present, no `<footer>` element, zero `<canvas>`
elements, zero gsap/lenis/three code in its network requests, and the
full login → OTP → overview auth flow still works end to end. `/app`
correctly inherits only the shared Checkpoint 1 theme tokens (already
approved, unchanged this checkpoint) — nothing else new.

### URL regression (Section 20)

| Route | Before | After |
|---|---|---|
| Homepage | `/` | `/` |
| How It Works | `/how-it-works` | `/how-it-works` |
| Platform | `/platform` | `/platform` |
| Pricing | `/pricing` | `/pricing` |
| Capabilities | `/capabilities` | `/capabilities` |
| Results | `/results` | `/results` |
| Company | `/company` | `/company` |
| Diagnostic | `/diagnostic` | `/diagnostic` |
| `/app`, `/private`, `/proposal/[token]`, `/api/*` | unchanged | unchanged |

Verified via `next build`'s own route table (identical before/after) and
a live hard-refresh + client-nav + back/forward Playwright pass against
all 8 marketing URLs.

### Motion lab (Section 22)

Still `robots: { index: false, follow: false }`, still unlinked from any
real nav/footer, its own header now explicitly says "internal, not a
preview of the real homepage" (unchanged copy from Checkpoint 2, still
accurate). The R3F comparison toggle UI is gone (`FluidFieldDemo.tsx`
simplified to a single panel). It deliberately stays **outside** the new
`(marketing)` route group — if it were moved inside, it would inherit the
real marketing Navigation/Footer/fluid-field wrapper, defeating its
purpose as an isolated test surface; it keeps its own self-contained
`LenisProvider` wrapper from Checkpoint 2 instead.

### Files added

`src/app/(marketing)/layout.tsx`,
`src/components/sections/MarketingMobileNav.tsx`,
`src/components/ui/DiagnosticCTA.tsx`,
`src/components/ui/MarketingSection.tsx`,
`src/components/ui/DisplayHeading.tsx`,
`src/components/ui/MediaFrame.tsx`,
`src/components/motion/{FluidFieldRawGL,MarketingFluidField,PageTransition}.tsx`
(`FluidFieldRawGL` moved from `motion-lab/`, not new — see Section 8/9).

### Files changed

`src/app/layout.tsx` (Chatbot/LanguagePrompt/Loader removed, comment
explaining why ConsentBanner stays), `src/components/sections/{Navigation,Footer}.tsx`,
`src/components/Loader.tsx`, `src/components/ui/Logo.tsx`,
`src/components/language/LanguageSwitch.tsx`,
`src/components/chatbot/Chatbot.tsx`,
`src/components/privacy/{ConsentBanner,ConsentPreferencesDialog}.tsx`,
`src/components/ui/HoldToConfirm.tsx` (real bug fix, see above),
`src/app/globals.css` / `tailwind.config.ts` (new fixed
`inverted`/`inverted-foreground` tokens),
`src/components/motion-lab/FluidFieldDemo.tsx` (R3F toggle removed,
import path updated).

### Files removed

`src/components/motion-lab/FluidFieldR3F.tsx`.

### Files moved (structural, content unchanged except the Navigation removal)

The 8 marketing `page.tsx` files into `src/app/(marketing)/`;
`FluidFieldRawGL.tsx` from `motion-lab/` to `motion/`.

### Tests performed

`tsc`/`eslint`/`build` clean throughout (checked after every major step,
not just at the end). `vitest` 22/22. Full Playwright regression: 38/39
(1 pre-existing intentional skip) — required two extra runs to separate
real bugs from load-induced flakiness (see "A note on dev-server
hygiene" below), with every failure individually chased to a specific
cause rather than re-run until green. A dedicated 27-test Checkpoint-3
scratch spec (deleted after use, per convention) covered: routing
regression (8 hard-refresh + client-nav + back/forward), scope isolation
(`/app` chrome/motion absence + full login flow, `/private` chrome
absence), desktop nav (all 6 links + CTA), mobile nav (open/link-
visibility/Escape/scroll-lock/focus-management/link-click-navigates —
all 4 passing only *after* the containing-block fix), theme (switch +
persistence across navigation), diagnostic smoke, consent (fresh +
returning user), i18n (EN→NL), and motion (cross-page navigation with
zero console errors, reduced-motion renders real content). Plus a
dedicated production-build network scan (homepage vs. `/app` vs.
`/private`) for the performance numbers below.

### A note on dev-server hygiene (process learning, not a product bug)

Twice this checkpoint, running a production build (`rm -rf .next && npm
run build`) while the **dev server was still running against the same
`.next` directory** produced spurious, hard-to-diagnose test failures
(a disabled "Next" button that should have been enabled, one `/private`
test failing with zero relation to anything touched). Both were chased
as if they might be real regressions before being correctly identified
as dev-server cache corruption from the build overwriting `.next`
mid-session — resolved by restarting the dev server after every
production-build check. Documented here so the same false alarm doesn't
cost investigation time again in a later checkpoint.

### Performance report (Section 24)

| Metric | Checkpoint 0 | Checkpoint 2 (with R3F) | Checkpoint 3 (final) |
|---|---|---|---|
| `.next/static/chunks` (directory total) | ~3.1MB | 4.2MB | **3.4MB** |
| three.js in compiled output | n/a | present (1 chunk) | **absent — 0 matches** |
| Homepage JS (network-measured) | not measured | 1326KB / 16 files | **1446KB / 18 files** |
| Homepage: gsap present? | n/a | no (unused) | **yes** (48KB gzipped, gsap+Lenis+ScrollTrigger combined) |
| Homepage: three.js present? | n/a | no | **no** |
| `/app` JS (network-measured) | not measured | not measured | **728KB / 11 files, zero gsap/lenis/three** |
| `/private` JS (network-measured) | not measured | not measured | **726KB / 11 files, zero gsap/lenis/three** |

**R3F/three removal effect**: directory total dropped 4.2MB → 3.4MB
(-0.8MB); the 236KB-gzipped three.js chunk Checkpoint 2 measured is
confirmed completely absent from the compiled output now, not just
unreferenced.

**GSAP/Lenis delivery**: now genuinely eager on marketing pages (mounted
in the layout, not dynamically imported) — the correct choice, since
scroll behavior needs to be present from first paint, not lazy-loaded in
after the fact. 48KB gzipped is the accepted, necessary cost of the
approved smooth-scroll foundation, flagged as an accepted number back in
Checkpoint 2's report, now the real measured cost of it actually being
used.

**WebGL delivery**: the fluid field's raw-WebGL2 code is still
dynamically imported (`next/dynamic(..., { ssr: false })`) inside
`MarketingFluidField`, same as on `/motion-lab` — confirmed via the same
network-scan methodology, no separate check needed since it's the
identical component.

**Marketing-only code absent from `/app`**: confirmed empirically, not
assumed — `/app/login`'s and `/private/login`'s own compiled JS was
downloaded and pattern-matched for gsap/Lenis/three signatures, zero
found in either.

**Dynamic/lazy chunk behavior**: unchanged from Checkpoint 2's verified
behavior — WebGL code only downloads on `/motion-lab` when actually
rendered/interacted with; the marketing fluid field now does the same on
real pages, confirmed via the same production-server network-scan
technique used throughout this project.

### Known limitations

- The "always-dark section" token bug (fixed for Footer/Loader/Chatbot/
  ConsentPreferencesDialog/Logo/LanguageSwitch this checkpoint) almost
  certainly still exists, unfixed, in every other pre-existing
  `bg-ink`/`text-paper`-as-always-dark component this checkpoint didn't
  touch — `Philosophy.tsx`, `ClientAuthOverlay.tsx`, `PlatformPanels.tsx`'s
  dark sections are the most likely candidates based on the pattern.
  Real, worth a dedicated pass or fixing incrementally as each is next
  touched (Checkpoint 4+ will touch several of these).
- `HoldToConfirm.tsx`'s own separately-flagged `useReducedMotion()`
  (motion/react's hook, not this project's `usePrefersReducedMotion()`)
  inconsistency — noted back in Checkpoint 0/1's audit — was **not**
  fixed alongside the pointer-capture bug in the same file, per this
  checkpoint's own "don't fix unrelated items unless required" instruction
  (the reduced-motion swap wasn't required to fix the pointer bug). Still
  tracked, still deferred.
- No real frame-rate/GPU profiling of the fluid field now that it's on a
  real page with real surrounding content weight (Checkpoint 2 flagged
  this as appropriate to defer until real-page integration — this
  checkpoint is that integration, so it's now overdue for Checkpoint 4).
- The footer's `FinalCTA`/lifting-panel content itself was explicitly
  out of scope per Section 11 ("do not build the full homepage CTA
  section here") and is unchanged.

### Anything intentionally deferred

Homepage/content-page interior redesign (Checkpoint 4), the fluid
field's final visual intensity/composition (explicitly Checkpoint 4's
job per Section 9's own framing), a dedicated GPU performance profile,
fixing the token-inversion bug in components this checkpoint didn't
touch, `MarketingSection`/`DisplayHeading`/`MediaFrame` adoption (built,
not yet used anywhere).

### Decisions requiring approval before Checkpoint 4

1. **The token-inversion bug punch list** — confirm whether to fix
   `Philosophy.tsx`/`ClientAuthOverlay.tsx`/`PlatformPanels.tsx`'s dark
   sections proactively at the start of Checkpoint 4 (likely touched
   anyway for homepage/content work) versus only as each is individually
   reached.
2. **Fluid field intensity/composition** — currently a flat 7% opacity,
   full-viewport, always-on wash behind every marketing page. Confirm
   this restrained baseline is the right starting point for Checkpoint
   4's "final hero effect" tuning, or whether it should be scoped down
   further (e.g., hero-section-only, not full-page) before that work
   begins.
3. **`DiagnosticCTA`'s unused `inline`/`dark` variants** — kept as
   defined-but-uninstantiated per the brief's own named examples; confirm
   they're still wanted or should be trimmed if Checkpoint 4 ends up not
   needing them.
4. **GPU/frame-rate profiling of the now-real fluid field** — recommend
   doing this early in Checkpoint 4, before any additional visual
   intensity is added on top of the current restrained baseline.

### Recommended next checkpoint

**Checkpoint 4 — Homepage**, per the approved plan. Awaiting go-ahead.

---

## Checkpoint 2 — Motion + WebGL Foundation (2026-09-30)

**Status: complete. Stopped for approval, per instruction.** This was a
systems/spike checkpoint, treated as such: nothing was applied to any real
route, no homepage/nav/`(marketing)` work was started, and both WebGL
options were genuinely built and measured rather than one being assumed.

### Dependencies added

`gsap` (^3.15.0, includes `ScrollTrigger`), `lenis` (^1.3.26) — both
required for the approved foundation. For the mandated Option A/B WebGL
spike: `@react-three/fiber` (^9.8.1), `three` (^0.186.1), `@types/three`
(dev). `npm audit`: the pre-existing `deepmerge-ts`/Prisma advisory only
(already documented in `docs/security-audit.md`, unrelated to any of
these) — no new advisories from this batch.

### Bundle impact — measured, not estimated

Checkpoint 0's baseline: `.next/static/chunks` ≈ 3.1MB. After this
checkpoint: **4.2MB** directory total — but that raw delta overstates the
real cost, since Turbopack's flat chunk directory mixes route-specific and
shared chunks. The number that actually matters — **what a real visitor's
browser downloads** — was verified empirically against the production
build (`next build` + `next start`, not dev mode), not inferred from
directory sizes:

- **Homepage (`/`)**: 16 JS files, 1326KB total, **zero** bytes of
  gsap/lenis/three code in any of them (checked by downloading and
  pattern-matching every JS response, not just trusting the bundler's
  intent) — confirms none of this checkpoint's additions reach any real
  marketing route yet, which is correct, since nothing has been wired into
  a real page.
- **`/motion-lab` on load**: gsap+Lenis+ScrollTrigger download immediately
  (58KB gzipped combined) — expected, since `LenisProvider`/`gsapHooks`
  are imported directly by the test page, not dynamically.
- **`three`/`@react-three/fiber`**: confirmed to **not** download on
  `/motion-lab` load or on scrolling to the fluid-field section — only
  after actually clicking the "React Three Fiber" toggle button (verified
  by watching network responses before and after the click). Gzipped
  size: **236KB** for the three.js chunk alone. This is the concrete,
  measured number behind the WebGL recommendation below.
- `next/dynamic(..., { ssr: false })` is used for both `FluidFieldRawGL`
  and `FluidFieldR3F` — confirms WebGL code genuinely can be route/
  interaction-lazy-loaded in this project, answering Section 16's
  question directly rather than asserting it.

### Motion architecture

`src/lib/motion/tokens.ts` — durations (`instant`→`cinematic`), easings
(`standard`/`enter`/`exit`/`morph`/`cinematic`, both as Motion-ready arrays
and GSAP/CSS-ready strings), springs (`subtle`/`responsive`/`expressive`).
`EASE.standard` is the *exact* `[0.16, 1, 0.3, 1]` curve already used ad
hoc throughout the existing codebase (and named `ease-modus` in
`tailwind.config.ts`) — reused, not replaced, so nothing existing needs to
change to benefit. Motion's existing responsibilities (component state,
layout morphing, hover/tap, shared-element transitions) are unchanged;
`Reveal.tsx` gained an opt-in `blur` prop (opacity+translate+blur, per
Section 7) with zero effect on any of its ~40+ existing call sites
(verified: full smoke/responsive suite still green). `Draw.tsx` (new) —
SVG `pathLength` draw-in via Motion, not GSAP's paid DrawSVGPlugin.
`NumberTicker`/`MagneticButton` (Count/Magnetic) were **reused as-is**,
not rebuilt — both already matched their Section 7 role exactly.

### GSAP architecture

`src/lib/motion/gsap.ts` — registers `ScrollTrigger` exactly once
(`ensureGsapRegistered()`, idempotent-guarded for Fast Refresh safety in
dev). `src/lib/motion/gsapHooks.ts` — four small, purpose-built hooks, not
one generic config-driven abstraction (per the explicit instruction not to
build "a giant generic animation abstraction"):
`useGsapReveal`/`usePinnedSequence`/`useBlurFocusTransition`/`useDrift`.
Every one uses `gsap.context(() => {...}, scopeRef)` scoped to the
caller's own DOM ref, so `ctx.revert()` on unmount tears down exactly the
tweens/ScrollTriggers that hook created and nothing else's — verified live
(see Tests below) via repeated mount/unmount/navigate-away-and-back
cycles producing zero console errors and zero accumulating triggers.
`usePinnedSequence`/`useDrift` skip creating anything at all under reduced
motion (checked via this project's own `usePrefersReducedMotion()`, not
GSAP's `matchMedia` helper — consistent with the established convention).

### Lenis architecture

`src/lib/motion/LenisProvider.tsx` — **not mounted globally** (confirmed:
grep shows zero references from `src/app/layout.tsx`); a page opts in by
wrapping its own tree, demonstrated concretely by `/motion-lab`'s own
`MotionLabScrollProvider`. This is the literal pattern Checkpoint 3 will
use to scope it to a `(marketing)` layout instead of one more page. GSAP
integration follows the documented Lenis+GSAP recipe: `autoRaf: false`,
`lenis.raf()` driven from `gsap.ticker.add()` (one RAF loop for the whole
page, not two), `gsap.ticker.lagSmoothing(0)`, and
`lenis.on('scroll', ScrollTrigger.update)` so pinned/scrubbed GSAP
timelines track the smoothed position. `anchors: true` (Lenis's own
built-in anchor-link handling) and `stopInertiaOnNavigate: true`.
**Reduced motion is handled explicitly, not via Lenis's own
`respectReducedMotion` default** (which still runs Lenis with `lerp`
forced to 1, still intercepting scroll) — a visitor with
`prefers-reduced-motion: reduce` never gets a `Lenis` instance constructed
at all, true native scrolling, per this checkpoint's own instruction not
to rely on implicit/global behavior.

### WebGL comparison — Option A (raw WebGL2) vs Option B (React Three Fiber)

Both were genuinely built, not assumed: `fluidFieldGL.ts`
(raw WebGL2 class) and `FluidFieldR3F.tsx` (R3F), **sharing the exact same
`FluidFieldPhysics` class and fragment-shader body** (`fluidPhysics.ts`)
so the comparison is about rendering/lifecycle infrastructure only, not
two differently-tuned effects.

| Criterion | Raw WebGL2 | React Three Fiber | Notes |
|---|---|---|---|
| Bundle cost | **0 extra bytes** (uses the browser's native WebGL2 API) | **+236KB gzipped** (three.js alone) | Measured, see above |
| Implementation complexity | ~215 lines, manual program/uniform/RAF/resize/dispose | ~150 lines for the component itself, but requires understanding R3F's reconciler model | R3F's *code* is shorter; its *conceptual surface* (a second reconciler on top of React) is larger |
| Lifecycle cleanup | Manual (`dispose()` — delete program, remove listeners, cancel RAF) — implemented and tested | **Automatic** — `<Canvas>` handles RAF/dispose/context loss internally on unmount | Genuine, real point in R3F's favor |
| Shader ergonomics | Direct GLSL, WebGL2 `#version 300 es` syntax | GLSL3 via `glslVersion={THREE.GLSL3}` — same shader body works nearly verbatim | Effectively a tie — proven by literally sharing the fragment shader source between both |
| Resize handling | Manual `ResizeObserver` + `gl.viewport()` — implemented and tested | Automatic via `<Canvas>` | Point to R3F |
| Pointer handling | Manual `pointermove` listener + rect math | Identical — R3F doesn't help here, both need the same manual listener | Tie |
| DPR management | Manual `Math.min(devicePixelRatio, 2)` cap | `dpr={[1, 2]}` prop — same cap, less code | Point to R3F |
| Theme integration | `setColors()` method call | Same pattern via a ref-based color object | Tie |
| Reduced-motion behavior | `if (reducedMotion) return null` before mounting — identical in both | Identical | Tie |
| Route transitions | Not yet tested against real route changes (no real route uses either yet) — both rely on standard unmount cleanup, which was verified | Same | Tie, deferred to real rollout |
| Future reuse (image bulge) | **Proven** — `imageBulgeGL.ts` reuses the identical class shape and full-screen-triangle technique | Not built for bulge in this spike; would work similarly but still carries the 236KB cost for what's still a 2D effect | Point to raw WebGL2 for MODUS's actual use case |
| Maintenance burden | Zero framework-specific friction with this project's own tooling | **Two real ESLint conflicts** hit and had to be explicitly suppressed with `eslint-disable` — React 19's newer compiler-oriented `eslint-plugin-react-hooks` purity/immutability/refs rules don't model R3F's non-DOM reconciler and flag its standard imperative-uniform pattern as if it were a DOM anti-pattern. Not a mistake in this code — a genuine, documented ecosystem friction point, real evidence for this row | Concrete point against R3F, found empirically not assumed |

**Recommendation: raw WebGL2.** The brief's own instruction was "if the
difference is not clear enough, say so instead of pretending there is a
winner" — here it *is* clear enough, for a specific reason: MODUS's WebGL
need (this checkpoint's fluid field, and the image-bulge spike below) is
fundamentally a **2D full-viewport shader effect**, not a 3D scene. R3F's
real advantages — scene graph, camera/lighting, a geometry/material
ecosystem, `drei` helpers — pay for themselves when you have an actual 3D
scene to manage; none of that applies to rendering one full-screen
triangle with a custom fragment shader, which is exactly what raw WebGL2
is simplest and cheapest at. The measured 236KB gzipped cost buys
lifecycle/resize/DPR convenience that raw WebGL2 already has (~40 lines of
straightforward, now-tested code) plus real linting friction the raw
version never hit. If MODUS ever wants genuine 3D (a rotatable product
model, a 3D data visualization), R3F would be the right call then — that's
a different problem than this checkpoint's.

**Both implementations remain in the repo** (`fluidFieldGL.ts` and
`FluidFieldR3F.tsx`, toggleable live on `/motion-lab`) so this comparison
stays reviewable and interactive rather than just prose — see "Decisions
requiring approval" below for whether to remove the R3F path and its
dependencies now that a recommendation has been made.

### Fluid-field technical design

Two-layer design, deliberately: `fluidPhysics.ts` (framework-agnostic
`FluidFieldPhysics` class — dt-scaled lerp toward the raw pointer target
for inertia/delayed-response, a smoothed velocity derived from the lag
itself for the trail, and a two-speed intensity easing — rises fast,
decays slow, so a fast flick visibly *settles* rather than snapping off)
plus a thin renderer (`fluidFieldGL.ts`) that only owns WebGL2
program/uniform/lifecycle plumbing. Fragment shader: a soft radial-falloff
"blob" at the smoothed pointer position, plus a smaller trailing blob
offset opposite the velocity vector — reads as a soft glow with a trail,
not a hard circle. Four interaction states (`idle`/`hover-cta`/
`hover-text`/`hover-media`) each set a target radius multiplier, eased
in/out by the same lerp physics — wired live on `/motion-lab` to real
hoverable CTA/text/media elements via `useFluidFieldHoverState`.

**Scope disclosure, stated plainly in the code and here**: this is a
smoothed, velocity-reactive glow/trail field — a deliberately lightweight
approximation of "fluid feel," **not** a full incompressible Navier–Stokes
simulation (the multi-pass advection/pressure/divergence solve real WebGL
fluid-cursor demos, including whatever technique the original
React-Bits-Pro reference likely uses, are built on). A true fluid sim is a
materially larger, specialized effort; the brief's own repeated caution
("should not be visually extreme... premium, not a gaming website")
doesn't call for that fidelity, and `MODUS_REDESIGN_PLAN.md` already
flagged the actual reference implementation as inaccessible (paid/gated)
back in Checkpoint 0 — this is an original MODUS interpretation of the
same *category* of effect, not a port, exactly as flagged then.

### Image-bulge technical design

`imageBulgeGL.ts` — literally the same class shape and the same
full-screen-triangle vertex trick as the fluid field, answering Section
11's "should this share infrastructure" question with a working proof
rather than an assertion. Differs only in: a texture upload step
(`loadImage()`, async, swaps the canvas in via an opacity transition only
once the texture is ready — no flash of an untextured quad), a cover-fit
UV transform (preserves the source image's crop instead of stretching to
the canvas's aspect ratio — verified visually against a non-square test
texture), and a lens/magnify fragment shader (pulls sampled UV toward the
pointer within a soft radius, easing to zero at its edge) instead of a
glow. `ImageBulge.tsx`'s underlying `<Image>` is always rendered — the
canvas is a `pointer-events: none` overlay shown only once WebGL2 support,
a fine pointer, and the loaded texture are all confirmed, so the effect
can only ever *add* to the image, never gate its availability (real
`<img>` markup stays in the DOM for SEO/screen readers/no-JS regardless).
**Used a generated grid SVG, not a stock photo**, for the test texture —
matches this project's existing discipline (`FieldPhoto.tsx`) of never
using fake photography, and a grid makes distortion visually legible in a
way a photo wouldn't for a technical spike.

### Image-reveal technical design

`useImageReveal.ts` (GSAP hook) — a `clip-path: inset()` bottom-to-top
wipe combined with a scale-settle (1.08→1.0) and an optional blur→focus
pass, `ScrollTrigger`-triggered once per element. Explicitly reduced-
motion-aware (not relying on the global CSS rule): under reduced motion
the hook sets the fully-revealed end state immediately via `gsap.set()`
and never creates the ScrollTrigger/tween at all — verified live (see
Tests).

### Reduced-motion strategy (Section 14 — dedicated, not the global CSS rule)

Every one of the four systems was given its own explicit check, using
this project's `usePrefersReducedMotion()` (not any framework's own
`matchMedia`/`useReducedMotion` helper, consistent with the established
convention and the real bug that convention exists because of):

- **Lenis**: never constructed — true native scroll, not `lerp: 1`.
- **GSAP**: `usePinnedSequence`/`useDrift` skip creating anything;
  `useGsapReveal`/`useImageReveal` jump straight to the end state via
  `gsap.set()`.
- **WebGL**: both fluid-field implementations and the image bulge return
  `null`/skip mounting entirely — no canvas element at all (verified:
  `page.locator("canvas").count()` is exactly 0 under emulated reduced
  motion, even after scrolling the field into view).
- **Motion**: unchanged — `MotionConfig reducedMotion="user"` (existing,
  root-mounted) already handles every `motion.*` component's `animate`
  transitions; `Reveal`'s new `blur` variant inherits this for free, no
  extra code needed.

### Touch/mobile strategy

No cursor-following effect is attempted on a coarse pointer — checked via
`window.matchMedia("(pointer: coarse)")`, not a screen-width guess (a
touch laptop at desktop width should still get the fallback; a
mouse-and-trackpad-only narrow window shouldn't lose it). Both the fluid
field and the image bulge simply don't mount their canvas at all on a
coarse pointer — verified live with a real `hasTouch: true` emulated
context (390×844), zero canvas elements, zero errors. No ambient
static-gradient fallback was built this checkpoint (the brief listed it as
one *option* among several, not a requirement) — flagged as a Checkpoint
3+ decision if a touch-specific ambient treatment is wanted for the real
homepage hero, rather than built speculatively now with nothing to attach
it to.

### Lifecycle/cleanup strategy — verified, not assumed

- **GSAP**: `gsap.context().revert()` per hook, scoped to the caller's own
  ref — confirmed via repeated navigate-away-and-back cycles (2x) with
  zero accumulating console errors.
- **Lenis**: `lenis.destroy()` + `gsap.ticker.remove(raf)` +
  `ScrollTrigger.refresh()` on `LenisProvider` unmount.
- **Raw WebGL2**: `dispose()` deletes the program, removes context-loss
  listeners; `stop()` cancels the RAF id (`null`-guarded, safe to call
  multiple times); `webglcontextlost`/`webglcontextrestored` handled
  (stops on loss, rebuilds and restarts on restore) — a real production
  concern most spikes skip, included here since it's low-cost and
  demonstrates real lifecycle hygiene.
- **R3F**: disposal is automatic on `<Canvas>` unmount (R3F's own
  documented behavior) — no manual `dispose()` needed, the one place R3F
  is genuinely simpler.
- **Visibility**: both WebGL implementations stop their render loop on
  `document.hidden` and resume on visible — verified by dispatching
  `visibilitychange` live and confirming zero errors, though actual GPU
  work pausing wasn't independently measured (would need a profiler, not
  just Playwright).

### Performance measurements

See "Bundle impact" above for the network-verified numbers. No frame-rate
profiling was done this checkpoint (would need a real GPU/CPU profiler,
not Playwright) — flagged as a gap, not silently skipped: worth doing
before any real rollout, not required to validate the *architecture*,
which is what this checkpoint was scoped to.

### Files added

`src/lib/motion/{tokens,gsap,gsapHooks,LenisProvider,useImageReveal}.ts`,
`src/lib/webgl/{fluidPhysics,fluidFieldGL,imageBulgeGL}.ts`,
`src/components/ui/Draw.tsx`,
`src/components/motion-lab/{FluidFieldRawGL,FluidFieldR3F,FluidFieldDemo,ImageBulge,ImageBulgeDemo,ImageRevealDemo,MorphExample,PinnedSequenceDemo,GsapRevealDemo,MotionLabScrollProvider}.tsx`,
`src/app/motion-lab/page.tsx` (noindex, unlinked — same convention as
`/design-system`), `scripts/generate-motion-lab-grid.mjs` +
`public/motion-lab/test-grid.svg` (generated, not a stock photo).

### Files changed

`src/components/ui/Reveal.tsx` (opt-in `blur` prop, backward compatible —
verified zero visual change to existing call sites via the full
responsive/smoke suite), `package.json`/`package-lock.json` (new
dependencies).

### Tests performed

All live, against a running server — bundle-content checks against the
actual **production build** (`next build` + `next start`), behavioral
checks against dev. Every item from the checkpoint's own list:

| Category | Test | Result |
|---|---|---|
| Technical | tsc / eslint / build / vitest / full Playwright regression | All clean — 38/39 e2e (1 pre-existing skip), 22/22 unit |
| Motion | Repeated route mount/unmount (2x navigate away/back) | Zero console errors |
| Motion | No duplicate RAF loop | Structural (single `gsap.ticker`-driven loop) + a frame-advance sanity check |
| Motion | No stale GSAP contexts / duplicate ScrollTriggers | `ctx.revert()` per hook, verified via repeated mount cycles |
| Motion | Lenis cleanup | `destroy()`/ticker-remove on unmount, verified no errors after remount |
| Motion | WebGL cleanup | `dispose()` (raw) / automatic (R3F), verified no errors after remount |
| Experience | Desktop/laptop | Verified via the full existing responsive suite (unaffected) + motion-lab itself |
| Experience | Mobile/touch fallback | Real `hasTouch` emulated context, 390×844 — zero canvas mounted, zero overflow |
| Experience | Light/Dark/System | Inherited from Checkpoint 1's system — theme switch works on `/motion-lab` |
| Experience | Theme switching while effects active | Switched theme with the fluid field scrolled into view and running — zero errors |
| Experience | Reduced motion | Dedicated tests per system (Lenis native scroll, GSAP static end-states, WebGL not mounted) — all passing |
| Experience | Keyboard scrolling | Space key scrolls the page correctly with Lenis mounted |
| Experience | Anchor scrolling | A real in-page anchor link, clicked, lands within the target section (Lenis's `anchors: true` intercept confirmed working) |
| Performance | Idle / pointer movement | Visual only this checkpoint — see "Performance measurements" gap above |
| Performance | Tab background/foreground | `visibilitychange` dispatched live, zero errors, RAF pause/resume wired |
| Performance | Resize | 390px resize mid-session, zero errors, zero horizontal overflow |
| Performance | Repeated route navigation | Covered by the mount/unmount test above |

### Anything that did not work (first attempt)

- **`var(--x)` bare CSS reference pattern from Checkpoint 1** — not a new
  issue, but worth noting this checkpoint's shader work double-checked
  that the fluid field's theme-aware colors are passed as JS float arrays
  into GLSL uniforms directly (not through a raw CSS `var()` string),
  sidestepping that entire class of bug by construction.
- **React Compiler-era ESLint purity rules vs. R3F's imperative pattern**
  — two real conflicts (`react-hooks/purity` on a bare `performance.now()`
  call, `react-hooks/refs` on reading `.current` during render to pass to
  `<shaderMaterial uniforms>`), both fixed (switching to R3F's own
  `useFrame` delta instead of a second `performance.now()` call; a
  narrowly-scoped, clearly-commented `eslint-disable-next-line` for the
  ref-in-render case, since that's the standard, necessary R3F pattern
  and the rule has no model of R3F's non-DOM reconciler). Both are real,
  documented findings feeding directly into the WebGL recommendation
  above, not swept under the rug.
- **Bulk background-fill `<div>` swatches for spacing tokens** (a
  Checkpoint 1 leftover pattern, unrelated to this checkpoint) — not
  touched, out of scope.

### Anything intentionally deferred

Real frame-rate/GPU profiling (flagged above, not required to validate
architecture); an ambient touch-specific fallback treatment (no real page
to attach it to yet); wiring the fluid field's `hover-cta`/`hover-text`/
`hover-media` states to anything beyond the test-lab's own demo elements;
any visual polish beyond what's needed to prove the systems work
correctly — this checkpoint was explicitly scoped as validation, not
production content, per Section 1/17.

### Decisions requiring approval before Checkpoint 3

1. **Confirm the raw WebGL2 recommendation.** If approved, recommend
   removing `@react-three/fiber`/`three`/`@types/three` and
   `FluidFieldR3F.tsx` at the start of Checkpoint 3 (or now, if preferred)
   — they were installed specifically to make this comparison real rather
   than asserted, and per "install only what is actually needed," the
   final dependency set should reflect the decision once it's made. Not
   removed yet since the comparison is more useful reviewable/interactive
   on `/motion-lab` while this report is being read.
2. **Where `LenisProvider` actually mounts.** Confirmed structurally
   ready (a page/layout just wraps its tree in it, proven on
   `/motion-lab`) — the real mounting point is the `(marketing)` route
   group, approved for Checkpoint 3 already. No new decision needed, just
   confirming the plan still holds after seeing it work.
3. **Real frame-rate profiling before rollout.** Recommend doing this once
   the fluid field is actually wired into a real page with real
   surrounding content/weight (Checkpoint 4+), not on the isolated test
   surface where nothing else is competing for the main thread — a
   profile taken now would be optimistic and not representative.
4. **Touch/mobile ambient fallback.** No effect at all was used for this
   checkpoint's coarse-pointer case (simplest, safest option). Recommend
   deciding whether a lighter ambient treatment is wanted for the real
   mobile homepage hero once Checkpoint 4 gets there — flagging now so
   it's a deliberate choice, not a default nobody decided on.
5. **`gsap`/`lenis`'s 58KB gzipped combined cost** will apply to every
   marketing page once Checkpoint 3 wires `LenisProvider` into the
   `(marketing)` layout — this is the accepted, necessary cost of the
   approved smooth-scroll foundation, not something to lazy-load away
   (scroll behavior needs to be present from first paint), flagged here
   only so it's a known, accepted number rather than a surprise later.

### Recommended next checkpoint

**Checkpoint 3 — Global Shell**: navigation, mobile navigation, the theme
switch's real placement, footer, cookie-dialog restyle, and — per
Checkpoint 0/1's approved architecture — the `(marketing)` route-group
migration (URLs unchanged) plus fixing the pre-existing `/app`-exclusion
gap in the four root overlay components, so `LenisProvider`/GSAP/WebGL
have a structural home rather than another pathname check. Awaiting
go-ahead.

---

## Checkpoint 1 — Design System Foundation (2026-09-30)

**Status: complete. Stopped for approval, per instruction.** Scope was
held to exactly what was approved: tokens, theme, typography, spacing,
grid/container primitives, button/link/form primitives, focus/selection
styling. No homepage redesign, no GSAP/Lenis/WebGL, no page-by-page
restyle, no `(marketing)` route-group migration, no material `/app`
redesign — all correctly deferred to their approved later checkpoints.

### Governing architectural rule applied

**Shared foundation, separate expression**, exactly as directed: theme
state, persistence, and semantic color tokens now live at the root layout
— the one layer marketing, `/app`, and `/private` all three already share
(confirmed in Checkpoint 0's audit: none of them have their own layout).
Nothing motion/WebGL-related was introduced this checkpoint, so the
"marketing-only" half of the rule has nothing to violate yet — it becomes
enforceable starting Checkpoint 2/3, and Checkpoint 0's route-group
recommendation is still the intended mechanism for it.

### Exact token architecture

Semantic CSS custom properties, defined once in `globals.css`'s
`@layer base`, are the single source of truth. `tailwind.config.ts`'s
color keys (the existing brand names — `paper`, `mineral`, `surface`,
`ink`, `graphite`, `muted`, `line`, `modus`, `signal` — plus new keys
`surface-elevated`, `line-strong`, `modus.foreground`, `modus.soft`,
`signal.foreground`) all resolve to these variables, so every existing
`bg-paper`/`text-ink`/`border-line`/etc. class across ~150+ existing files
became theme-aware with **zero call-site changes** — this was the explicit
goal and it held.

**A real bug was found and fixed while building this, not assumed
correct from the design:** the first implementation defined each token as
`var(--x)` resolving straight to a hex string. Compiling the CSS and
inspecting the actual output (not just trusting the source) showed this
silently broke Tailwind's `/NN` opacity modifier — `bg-ink/40`,
`bg-signal/8`, and 136 other existing call sites across the codebase would
have all lost their transparency, rendering fully opaque instead. Fixed
by switching every token consumed via a Tailwind color key to
space-separated RGB channels (`--accent: 18 60 45`) with
`rgb(var(--accent) / <alpha-value>)` in the Tailwind config — the
documented Tailwind v3 pattern for an alpha-composable CSS-variable color.
Verified by compiling raw CSS output directly (`npx tailwindcss -i ... -o
...`) and confirming `bg-ink\/40 { background-color: rgb(var(--text-primary)
/ 0.4); }` — a real value, not a dropped modifier.

A **second, related bug** surfaced only once real keyboard-focus testing
ran: `:focus-visible { outline: 2px solid var(--accent); }` is invalid CSS
once `--accent` holds bare RGB channels instead of a full color — the
whole declaration silently failed and the browser fell back to its
default `currentColor` outline, which happened to render in
`text-graphite` for the button under test. A Playwright check using real
keyboard Tab navigation (not `.focus()`, which doesn't reliably trigger
`:focus-visible` in Chromium) caught this. Fixed by wrapping the one
remaining raw consumption in `globals.css`: `outline: 2px solid
rgb(var(--accent));`. `--selection-bg`/`--selection-fg`/`--fluid-primary`/
`--fluid-secondary` were deliberately kept as plain hex (never consumed
through a Tailwind opacity-modifier class), so they didn't need this.

**Full token table:**

| Token | Light | Dark | Note |
|---|---|---|---|
| `--canvas` | `250 250 248` (existing `paper`) | `21 23 22` (existing `ink`, reused) | |
| `--canvas-secondary` | `244 244 240` (existing `mineral`) | `28 31 29` | new dark value |
| `--surface` | `235 235 229` (existing `surface`) | `36 40 38` | new dark value |
| `--surface-elevated` | `250 250 248` (= canvas; matches existing paper-drawer convention) | `44 48 45` | dark uses a lighter fill, not shadow, for elevation — standard dark-mode practice since shadows read poorly on near-black |
| `--text-primary` | `21 23 22` (existing `ink`) | `250 250 248` (existing `paper`, reused) | |
| `--text-secondary` | `38 42 40` (existing `graphite`) | `200 203 197` | new dark value |
| `--text-muted` | `112 117 111` (existing `muted`) | `139 143 135` | new dark value |
| `--line` | `217 220 215` (existing `line`) | `50 54 47` | new dark value |
| `--line-strong` | `125 129 119` | `114 120 108` | new token, both themes — no existing equivalent |
| `--accent` | `18 60 45` (existing `modus`, unchanged) | `47 158 118` | dark is a brighter tonal derivative — see below |
| `--accent-light` | `27 90 67` (existing `modus.light`) | `56 179 130` | |
| `--accent-dim` | `13 43 32` (existing `modus.dim`) | `27 90 67` | |
| `--accent-foreground` | `250 250 248` | `21 23 22` | new — text-on-accent-background pairing |
| `--accent-soft` | `rgba(18,60,45,0.08)` | `rgba(47,158,118,0.18)` | plain rgba, not opacity-modifier-composable |
| `--danger` | `224 58 46` (existing `signal`, unchanged) | `224 58 46` (same) | see "not fixed" below |
| `--danger-foreground` | `250 250 248` | `250 250 248` (same) | |
| `--fluid-primary` / `--fluid-secondary` | `#1b5a43` / `#0d2b20` | `#38b382` / `#1b5a43` | **reserved, not consumed by any component yet** — for Checkpoint 2's WebGL field |
| `--selection-bg` / `--selection-fg` | `#123c2d` / `#fafaf8` | `#2f9e76` / `#151716` | raw hex, drives `::selection` only |

The existing MODUS accent (`#123c2d`) is **unchanged** in light mode, per
the approval. The dark-mode accent (`#2f9e76`) is the one place a tonal
scale was derived from it, exactly under the permitted exception ("unless
a technically necessary tonal scale is derived from it") — the original
green fails WCAG contrast against a near-black canvas (see numbers below),
so a brighter tint of the same hue was computed, not a different color.

**WCAG contrast, computed (not eyeballed) via the standard relative-
luminance formula, every pairing this checkpoint actually introduces or
relies on:**

| Pairing | Ratio | Result |
|---|---|---|
| light text-primary / canvas | 17.23:1 | pass (AA normal) |
| light text-secondary / canvas | 13.91:1 | pass |
| light text-muted / canvas | 4.50:1 | pass (exactly at the AA-normal floor — this is the existing production value, unchanged) |
| light accent-foreground / accent (button text) | 11.75:1 | pass |
| light line-strong / canvas (non-text UI, 3:1 threshold) | 3.81:1 | pass |
| dark text-primary / canvas | 17.23:1 | pass |
| dark text-secondary / canvas | 10.98:1 | pass |
| dark text-muted / canvas | 5.47:1 | pass |
| dark text-muted / surface | 4.52:1 | pass |
| dark accent / canvas | 5.38:1 | pass |
| dark accent-foreground / accent (button text) | 5.38:1 | pass |
| dark line-strong / canvas (non-text UI) | 3.96:1 | pass |

**Found, not fixed (pre-existing, flagged per the "identify, don't
silently fix" discipline):** the brand's `signal` red (`#e03a2e`) only
reaches **4.13–4.17:1** against both the light canvas and the new dark
canvas — AA-large-only, not AA-normal — and it's used as small-size body
text in real places today (form validation error messages at 12–12.5px in
`ValidatedInput.tsx`/`ValidatedTextarea.tsx`/`PhoneInput.tsx`/
`StepBusiness.tsx`, among others). This predates V2 entirely — it's the
current shipped brand hex, unchanged by this checkpoint — and correcting
a brand color is beyond a design-tokens checkpoint's scope. Flagged here
for a future accessibility pass, not silently altered.

**A second, unrelated pre-existing gap found during verification, also
not fixed:** `bg-modus/8` and `bg-signal/8` (`StatusBadge.tsx`) have never
actually compiled to a translucent background in any version of this
project — `8` isn't a step in Tailwind's default opacity scale (`0, 5,
10, 15, 20, ...`) and this Tailwind version doesn't fall back to treating
a bare unbracketed number as a raw percentage. Confirmed by compiling the
CSS directly and finding zero `/8` opacity classes generated anywhere in
the output, for any color, before or after this checkpoint's changes —
not something this checkpoint introduced or worsened.

### Exact theme architecture

Mirrors the existing `LocaleProvider`/cookie pattern exactly, so it's a
second instance of an already-proven approach rather than a new one:

- `src/lib/theme/config.ts` — `Theme = "light" | "dark" | "system"`,
  `THEME_COOKIE = "modus_theme"`, `DEFAULT_THEME = "system"`.
  **Deliberate asymmetry with locale, documented in the file itself**:
  locale always defaults to English and never auto-follows the browser;
  theme defaults to the OS preference by default, since respecting a
  rendering preference (vs. a content-language decision) is the
  conventional, accessibility-friendly default. Flagging this as a
  decision, not an oversight, in case a Light default is preferred instead.
- `src/lib/theme/server.ts` — `getInitialTheme()`, reads the cookie
  server-side, same shape as `getInitialLocale()`.
- `src/lib/theme/context.tsx` — `ThemeProvider`/`useTheme()`, sets
  `document.documentElement.dataset.theme` and the cookie on change, same
  shape as `LocaleProvider`/`useLocale()`.
- `src/lib/theme/useResolvedTheme.ts` — a `useSyncExternalStore`-based
  hook (matches this project's own established pattern, e.g.
  `usePrefersReducedMotion`) that resolves "system" against the live OS
  preference, for display purposes only (e.g. "System (dark now)" in the
  test-surface switcher) — the actual rendering doesn't need this, see
  below.
- **CSS-only resolution, zero flash, zero JS required for the common
  case**: `globals.css` defines the light tokens on `:root`, then the same
  values again under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }`,
  then again under `:root[data-theme="dark"]` (last in source order, wins
  regardless of OS preference via cascade order at equal specificity).
  "system" and no `data-theme` attribute at all are treated identically —
  both fall through to the OS-preference block. An explicit "light" or
  "dark" choice is rendered server-side via `<html data-theme={initialTheme}>`
  in `layout.tsx`, from the cookie, so a returning visitor's explicit
  choice is correct on the very first byte — no inline blocking script
  needed, unlike a typical localStorage-only theme implementation.
- Root layout now reads `getInitialTheme()` alongside `getInitialLocale()`
  and wraps children in `ThemeProvider`, nested outside `LocaleProvider`
  (order doesn't matter functionally, both are independent contexts).

### Font decisions

No new typeface introduced. Display/Body/Technical are implemented as
**weight/size/tracking roles on the two existing families** (Inter for
display+body, IBM Plex Mono for technical), not three separate fonts —
the audit found only Inter+IBM Plex Mono in use anywhere, and introducing
a third typeface is a bigger, separately-approvable decision the brief's
Section 10 doesn't explicitly require (it asks for type *roles*, which
weight/size/tracking already deliver). A distinct display typeface remains
an option for Checkpoint 4 if the homepage work wants one — not decided
now.

### Spacing decisions

Existing `Container`/`WideBleed` components and every section's ad hoc
`py-*` values are **completely untouched** — this checkpoint does not
redesign layout. Five new reserved spacing tokens (`gutter`, `section-sm`,
`section`, `section-lg`, `section-xl`) were added to
`tailwind.config.ts`'s `spacing` scale for later checkpoints to reach for
instead of inventing per-page numbers; none are consumed anywhere yet.

### Typography scale

`display-lg`/`display-md`/`display-sm` were converted from fixed `rem`
values to `clamp()` — same ceiling as before (so nothing existing gets
bigger), fluid below it instead of snapping at Tailwind breakpoints. A new
`display-xl` was added (reserved for Checkpoint 4, unused today). Verified
at 390px via Playwright that this doesn't introduce any new horizontal
overflow on existing pages (full responsive + smoke suites still pass).

### Files changed

- `src/app/layout.tsx` — wired `ThemeProvider`/`getInitialTheme()`,
  `<html data-theme>`.
- `src/app/globals.css` — full token block (light/dark/system CSS custom
  properties), `::selection`/`:focus-visible` now theme-aware, a short
  (150ms, fully neutralized under reduced-motion) background/color
  transition on `body`.
- `tailwind.config.ts` — colors rewired to `rgb(var(--x) / <alpha-value>)`,
  new color keys (`surface-elevated`, `line-strong`, `modus.foreground`,
  `modus.soft`, `signal.foreground`), fluid `display-*` sizes + new
  `display-xl`, five new reserved spacing tokens. `borderRadius` left
  completely untouched — already restrained and intentional, per the
  Checkpoint 0 audit.

### Files added

- `src/lib/theme/{config,server,context,useResolvedTheme}.ts`
- `src/components/ui/Button.tsx` — primary/secondary/ghost, two sizes,
  optional `href` (renders a `Link`), disabled state. Matches existing
  hand-rolled button classes exactly (same tokens underneath), not wired
  into any real page yet.
- `src/components/ui/Input.tsx` — `Input`/`Textarea`, default/valid/error
  tones, factored out of `ValidatedInput`'s visual contract without
  touching `ValidatedInput` itself (diagnostic files stay untouched this
  checkpoint).
- `src/components/ui/ThemeSwitch.tsx` — Light/Dark/System control,
  deliberately mirrors `LanguageSwitch`'s exact interaction pattern (mono
  labels, active underlined) rather than inventing a new one.
- `src/app/design-system/page.tsx` — the temporary internal test surface
  (typography, spacing, surfaces, borders, accent states, buttons, form
  fields, focus), `robots: { index: false, follow: false }`, not linked
  from nav/footer.

### Visual impact

**Zero visual change to any existing route in light mode** — the whole
point of resolving every existing brand-name Tailwind class through
identical-value CSS variables. Verified via the full pre-existing
Playwright suite (38/39, same pre-existing skip) and the responsive/smoke
suites specifically, all passing unchanged. New capability: every existing
route now also renders correctly in dark mode (verified: all 8 marketing
routes + `/diagnostic`, zero console errors, under `prefers-color-scheme:
dark` emulation) — this **is** new visible behavior (a dark version of the
whole site now exists where none did before) but it only activates for a
visitor with a dark OS preference or an explicit choice; nothing about the
default light experience changed.

### Effect on existing `/app`

`/app` was not materially redesigned, per the constraint, and its own
component code is untouched. But because `/app` shares the same root
layout (confirmed in Checkpoint 0's audit) and already uses the same
brand-name Tailwind classes (`bg-mineral`, `bg-paper`, `text-ink`, etc.),
it **automatically inherits the shared theme system today** — this is the
intended outcome of "shared foundation," not a leak, and was verified
live: with a dark OS preference, `/app/overview`'s body and `bg-mineral`
surfaces correctly render the dark tokens (`rgb(21, 23, 22)` /
`rgb(28, 31, 29)`), zero console errors, zero functional regression (the
auth-guard/session flow, tested separately, still works). **One partial
inconsistency found, not fixed**: `/app` has a few raw-hex SVG elements
(`ModusScore.tsx`'s progress ring, `Sparkline.tsx`'s chart strokes, and
inline hex in `overview`/`performance`/`website` page SVGs) that don't
consume CSS variables, so they'll keep rendering their light-mode color
even when the rest of `/app` goes dark. This was already flagged as a
Checkpoint-0-discovered risk (Section 3 of the plan); fixing it means
editing `/app` dashboard files, which is out of this checkpoint's scope
(no material `/app` redesign) — left as a known, minor, pre-existing-class
gap for whenever `/app`'s own Dashboard V2 Appearance setting work happens.

### Tests performed (per the checkpoint's own list)

All performed live via Playwright against the running dev server, plus
`tsc`/`eslint`/`build`/`vitest`. Every item from the requested list:

| Test | Result |
|---|---|
| First load | Pass — no hydration-mismatch console error |
| Hydration | Pass — same check, explicit `waitForLoadState("networkidle")` |
| Direct hard refresh | Pass — explicit `page.reload()` after setting dark, `data-theme` and computed background both still correct |
| Light | Pass — explicit choice renders `rgb(250, 250, 248)` regardless of OS preference |
| Dark | Pass — explicit choice renders `rgb(21, 23, 22)` regardless of OS preference |
| System | Pass — resolves against OS preference with zero JS (pure CSS media query) |
| Persisted preference | Pass — cookie survives a hard reload, correct theme on the very first server-rendered byte |
| OS theme change while System is selected | Pass — `page.emulateMedia()` flipped live, no reload, canvas color updated automatically (pure CSS reactivity, no listener needed for the color itself) |
| Keyboard use | Pass — real Tab-key navigation reaches the theme switch and operates it (not `.focus()`, which doesn't reliably trigger the same code path) |
| Contrast/focus | Pass — WCAG ratios computed for every pairing (table above); focus-visible ring verified via real keyboard focus to render the correct accent color in both themes, after finding and fixing the `var(--accent)` raw-CSS bug above |
| Mobile | Pass — 390px, zero horizontal overflow, after finding and fixing a real overflow bug in the new test-surface page's own header row (fixed: `flex-col` stacking below `sm:`) |
| Existing public pages | Pass — all 8 marketing routes + `/diagnostic`, zero console errors under dark |
| `/app` | Pass — renders correctly, inherits shared dark tokens as intended, zero console errors, auth flow unaffected |
| `/private` | Pass — unauthenticated redirect still works, unaffected |
| `/diagnostic` | Pass — full existing Playwright diagnostic-flow suite (happy path + optional-field edge case) still passing unchanged |

Full regression: `tsc --noEmit` clean, `eslint .` clean, `next build`
clean (38 routes — 37 existing + the new `/design-system`), `vitest run`
22/22, `playwright test` 38/39 (1 pre-existing intentional skip,
unrelated). All scratch spec files used for this checkpoint's own testing
were deleted afterward, per this project's established convention.

### Decisions requiring approval before Checkpoint 2

1. **`display-xl` and the reserved spacing tokens are unused placeholders
   today.** No decision needed now — flagging only so it's clear they're
   intentionally inert, not dead code from a mistake, when Checkpoint 4
   picks them up.
2. **The pre-existing `bg-modus/8`/`bg-signal/8` gap** (`StatusBadge.tsx`)
   — recommend a one-line fix (round to `/10` or `/5`, both valid) whenever
   `StatusBadge.tsx` is next touched for any reason, rather than a
   dedicated fix now. Not blocking.
3. **The pre-existing `signal` red AA-large-only contrast** — recommend
   deferring to a real accessibility pass rather than adjusting a brand
   color unilaterally; flagging again here since Checkpoint 2's WebGL
   fluid-field work will likely also touch the `signal`/`danger` family
   conceptually (as a possible "risk" state color) and should inherit this
   same open question rather than silently resolve it.
4. **`/app`'s raw-hex SVG elements not adapting to dark** — no action
   needed now; flagging so it's remembered as a concrete, small punch-list
   item once `/app`'s own Appearance setting work begins, since by then
   the token system will already be in place and it's a quick fix.
5. **Where the theme switch itself eventually lives in real UI** — the
   `ThemeSwitch` component exists and works, but hasn't been placed in
   the real nav/footer/settings yet (only on the internal test surface).
   That placement is a Checkpoint 3 (Global Shell) decision, not decided
   here.

### Anything intentionally deferred

Everything outside the approved Checkpoint 1 scope: GSAP/Lenis/WebGL (any
of it, including the Checkpoint 2 spike), the `(marketing)` route-group
migration, the four-overlay-component `/app`-exclusion fix, homepage or
any other page's visual redesign, and real placement of the theme switch
in production UI.

### Recommended next checkpoint

**Checkpoint 2 — Motion + WebGL Foundation**, per the approved plan:
Lenis, GSAP/ScrollTrigger, the fluid-field WebGL effect, and — per the
explicitly approved condition — a real technical spike comparing React
Three Fiber against raw WebGL2 before committing to either, built and
tested in an isolated area first. Awaiting go-ahead.

---

## Checkpoint 0 — Audit + Baseline (2026-09-30)

**Status: complete. Stopped for approval, per instruction. No visual,
dependency, or component changes made.**

### Files added
- `MODUS_REDESIGN_PLAN.md` — full audit findings, architecture
  recommendations, and the adopted checkpoint list.
- `MODUS_REDESIGN_REPORT.md` — this file.

### Files changed
None. This checkpoint was read-only by design (`rm -rf .next` was run to
force a clean build for baseline measurement — a build-cache clear, not a
source change).

### Files removed
None.

### Visual changes
None — explicitly out of scope for this checkpoint.

### Functional changes
None.

### Animation changes
None. No new dependencies (GSAP/Lenis/React Three Fiber) were installed —
confirmed not present in `package.json` before or after this checkpoint.

### Responsive changes
None.

### Tests performed
Full baseline verification, run fresh (not reused from a prior session):

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean, 0 errors |
| `npx eslint .` | Clean, 0 errors/warnings |
| `npm run build` (Next 16.3.3, Turbopack) | Clean, all 37 routes compile |
| `npx vitest run` | 22/22 unit tests passing (pricing engine suite) |
| `npx playwright test --project=chromium` | 38/39 passing, 1 pre-existing intentional skip (`/private` valid-credentials test, requires a manually-swapped temp password per its own in-file comment — not related to this checkpoint) |

Build output: 37 routes, all server-rendered dynamically (`ƒ`) — no static
routes exist currently, a pre-existing consequence of reading the locale
cookie in root layout, documented in the plan (Section 11/13). Build
artifact baseline: `.next/static/chunks` ≈ 3.1MB, `.next` total ≈ 134MB
(dev cache included) — recorded here as the pre-GSAP/Lenis/WebGL bundle
baseline to compare against once Checkpoint 2 adds those dependencies.

### Existing functionality verified
- Full Diagnostic happy path (intro → 6 steps → review → submit →
  estimate) — passing.
- Diagnostic optional free-text field edge case — passing.
- Customer-context personalization: anonymous → starts diagnostic → nav
  CTA becomes "Continue Diagnostic"; completed-diagnostic → personalized
  homepage/pricing; starting fresh from the profile-ready screen clears
  context — all 5 scenarios passing, confirms the dynamic-CTA
  personalization system documented in the plan is real, tested, working
  behavior today.
- Loader: skips entirely under reduced motion, shows/clears correctly
  under normal motion — both passing (this is the exact bug class flagged
  as a risk for the new motion work in the plan; good that the existing
  fix is still holding).
- `/private` auth: unauthenticated redirect, wrong-credential rejection,
  unauthenticated API rejection — all passing.
- Responsive: home/pricing/diagnostic/private-login clean at 4 breakpoints
  (1440×900, 1920×1080, 768×1024, 390×844), no horizontal overflow.
- Smoke: all 8 public routes load with zero console errors; nav +
  language switch (EN↔NL) work; footer + chatbot trigger present; pricing
  CTA navigates to `/diagnostic`.

### Known limitations of this audit
- Codebase inspection was targeted (grep + direct file reads guided by the
  brief's own checklist) rather than a line-by-line read of all ~250
  source files — sufficient to answer every question the brief asked, but
  a few page-level `sections/` components (the 36 in that directory) were
  inventoried by name/purpose, not individually read in full. None of the
  architectural conclusions in the plan depend on their internal
  implementation detail.
- Bundle-size baseline (`.next/static/chunks` ≈ 3.1MB) is a rough directory
  size, not a proper per-route First Load JS breakdown — Turbopack's
  `next build` output in this Next.js version doesn't print the classic
  webpack-style per-route size table. A more precise baseline (e.g. via
  `@next/bundle-analyzer`) would be worth adding before Checkpoint 10's
  performance pass specifically, not needed for Checkpoint 0.
- Did not attempt any spike/proof-of-concept installs of GSAP/Lenis/R3F to
  verify the integration risks named in the plan empirically — those are
  informed predictions based on how these libraries generally behave with
  Next.js App Router + React 19 Strict Mode + this project's existing
  cookie-driven dynamic rendering, not yet proven against this specific
  codebase. Checkpoint 2 is where that gets proven for real, in an
  isolated test area, per the brief's own instruction.

### Concerns / decisions needing approval before Checkpoint 1

1. **Tailwind v3 vs. v4** (plan Section 12). Recommend staying on v3 and
   hand-authoring the semantic CSS-custom-property token layer the brief
   describes, rather than upgrading to v4 first. Nothing in the brief
   strictly requires v4 — only the token *architecture* it describes,
   which v3 can express fine. A v4 upgrade would be its own
   isolated, higher-risk migration with no clear payoff for this brief
   specifically. **Recommend: stay on v3, revisit only if a concrete v4
   feature becomes necessary later.**
2. **Route-group restructure for motion scoping** (plan Section 11/16).
   Recommend introducing a `src/app/(marketing)/` route group so
   Lenis/GSAP/WebGL providers mount structurally only around marketing
   pages, rather than relying on another `pathname?.startsWith(...)` check
   (the same pattern that already has a live gap today — `/app` isn't
   excluded from `Chatbot`/`LanguagePrompt`/`ConsentBanner`/`Loader`, see
   plan Section 9/15). This does mean moving existing page files into a
   new folder (URLs unchanged, App Router route groups don't affect the
   URL) — a mechanical but real file-move across all 8 marketing routes.
   **Recommend doing this at the start of Checkpoint 3** (Global Shell),
   since that's the first checkpoint that needs the distinction to exist.
3. **Fix the `/app`-exclusion gap in the 4 existing overlay components**
   (plan Section 9/15) while touching this area anyway, even though it
   predates V2. Low-risk, one line each. **Recommend: yes, bundle it into
   whichever checkpoint first touches these components** (likely
   Checkpoint 3), rather than a separate unscoped fix now.
4. **React Three Fiber vs. raw WebGL2** for the fluid-field effect (plan
   Section 12). No recommendation yet — this needs the Checkpoint 2 spike
   to compare real bundle-size/complexity tradeoffs before deciding.
   Flagging now so it's an explicit Checkpoint 2 decision point, not
   default to R3F just because the reference used it.
5. **`siteUrl` placeholder and missing `robots.txt`/`sitemap.ts`** (plan
   Section 9/15) — pre-existing gaps, unrelated to visual redesign but
   likely to surface during Checkpoint 8. Not asking for a decision now;
   flagging so fixing them mid-redesign doesn't look like scope creep when
   it happens.
6. **Shared theme system with the separately-queued `/app` Dashboard V2
   brief** (plan Section 18) — recommend building the token/cookie/provider
   layer once as part of this redesign's Checkpoint 1, and having the
   `/app` Settings "Appearance" theme toggle (from the other, still-queued
   brief) consume the same system when that work eventually happens,
   rather than building two theme implementations independently.

### Anything intentionally deferred
Everything past Checkpoint 0 — no design tokens, motion primitives,
component redesigns, or dependency installs have been started, per the
brief's own explicit instruction to perform Checkpoint 0 only and stop.

### Recommended next checkpoint
**Checkpoint 1 — Design System Foundation**: semantic color tokens (light
+ dark + system), typography roles (display/body/technical-mono) with
fluid `clamp()` sizing, spacing tokens, a 12-column grid system, and base
component restyle (buttons, links, inputs, focus states) — built and
verified in an isolated internal test/demo page before touching any real
route, per the brief's own Checkpoint 1 instructions. Awaiting go-ahead.
