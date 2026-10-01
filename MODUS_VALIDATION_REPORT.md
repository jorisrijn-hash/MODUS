# MODUS Validation Report

Evidence for the Antimetal visual and motion rebuild. This file records what
was actually run and actually seen. Claims without evidence do not belong
here, and a passing build is not evidence that an interaction works.

Status vocabulary: COMPLETE / INCOMPLETE / BLOCKED.

---

## Checkpoint A — Audit and baseline — COMPLETE

| Check | Result |
|---|---|
| Repository instructions read | `CLAUDE.md` → `AGENTS.md`. Next.js docs in `node_modules/next/dist/docs/` noted as authoritative for this Next version. |
| Build pack located and extracted | `~/.Trash/MODUS-CLAUDE-BUILD-PACK.zip` → scratchpad. All 18 manifest files present. |
| Supplied assets inspected | All four PNGs and all five Antimetal JPGs opened and viewed. Findings in `MODUS_REBUILD_PLAN.md` §2. |
| Paper inspected | **No.** No Paper MCP connection available this session. Recorded as a limitation; no Paper claim is made anywhere. |
| Routes and providers mapped | `MODUS_REBUILD_PLAN.md` §3. |
| Version control | **Was absent.** Repo rooted at `/Users/joris`; `modus/` untracked. Resolved: `git init`, baseline commit `643cfad`, 289 files. `.env` verified excluded. |
| Pre-existing test baseline | Not yet captured — see below. |

### Pre-existing failures, captured before any edit

| Check | Baseline result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `eslint .` | 0 errors |
| Playwright | 1 pre-existing failure (below), 1 skipped |

**Pre-existing failure, attributed by measurement rather than assumption:**
`diagnostic-checkpoint5.spec.ts` → *"a failed submission shows a calm retry
state, preserves answers, and a retry can then succeed"*. Fails at line 147
(`expect(getByText(/ESTIMATE|ENGAGEMENT/i)).toBeVisible` — element not found).

It failed 3/3 on the rebuild branch, so it is not flaky. To establish whether
this rebuild caused it, the working tree was committed, `643cfad` (the
untouched baseline) was checked out, the dev server restarted against a clean
`.next`, and the single test re-run: **it fails identically on the baseline.**
Pre-existing, unrelated to this work, and not fixed by it. An earlier note
describing it as "flaky" was wrong and is corrected here.

---

## Checkpoint B — Foundation — COMPLETE

| Item | Evidence |
|---|---|
| Palette replaced | `globals.css` token values: ground `#D7D7D0`, cream `#F4F4E7`, ink `#1A1614`, line `#BDBDB5`, green `#1E3B2E`. Architecture (RGB-channel custom properties) unchanged, so all ~150 existing `bg-paper`/`text-ink` call sites moved with it. |
| Contrast, measured | ink on ground **11.7:1**. Study muted `#64635D` on ground measured **4.10:1** — below AA for body text — so `--text-muted` ships as `#585751`, **4.93:1**. Deviation deliberate and documented in the token comment. |
| Dark mode derived from the new palette | Ground becomes the reference's own ink, text becomes its cream. `#1E3B2E` measures 1.4:1 on that ground and is unusable as an accent, so dark mode promotes the study's own lighter family member `#759B72` (**11.0:1**) rather than inventing a hue. |
| Fonts | Noto Serif (display, explicitly the mandate's fallback — no Signifier licence exists in this repo), Geist (sans), Geist Mono. Replaces Inter / IBM Plex Mono. |
| Osmo scaling | Implemented as `--sf`, a *length* equal to 1px at the ideal design width (`--size-container / --size-container-ideal`). Design dimensions convert by multiplication (`calc(417 * var(--sf))`), so no nested em compounding. Body font-size carries a 15px floor; Osmo's own formula yields ~11.02px at the 992px desktop boundary, which is not readable body copy. |
| Container | 1512px max, 120px desktop / 24px mobile gutters. |
| `BracketFrame` | Dashed 1px frame + four solid 10×10 L corners, 1.5px stroke, butt/miter, `pointer-events-none` + `aria-hidden`. Active tone is solid MODUS green with no corner marks, matching the filled card in `stack-corner-reference.png`. Padding identical in both tones so activation cannot reflow a card. |
| Border radius | **Deliberately not changed.** Zeroing `rounded` would have squared off every button in `/app` and `/private` before those routes are migrated. New components state `rounded-none` / `rounded-full` explicitly. Revisit at Checkpoint G. |

## Checkpoint C — Homepage composition — PARTIAL

Done: navigation (left link capsule, centred collapsing lockup, right
actions), hero, manifesto, diagnostic entry, section 02. Sections below
section 02 (`WhatModusSees`, `CapabilitiesPreview`, `CasesPreview`,
`PlatformTeaser`, `PricingPreview`, `FinalCTA`, `Footer`) still carry the
previous visual language and are **INCOMPLETE**. FAQ is not built.

Captures: `hero-1440-light`, `hero-disorder`, `hero-ordered`, `dark-fixed`,
`m-top`, `m-390-fixed` (full page, 390×10572).

## Checkpoint D — Hero point cloud — SUBSTANTIALLY COMPLETE

Buffered `THREE.Points`, typed arrays mutated in the frame loop, seeded
(`mulberry32`) so captures are reproducible. 111 nodes high / 72 low; six
Gaussian clusters; Fibonacci sphere r=1.5; perspective `[0,0,6]` FOV 45,
portrait FOV widened by `min(120°, 2·atan(tan(fov/2)/aspect))`; tier scales
1 / 1.7 / 2.6; DPR capped 2 / 1.

| Required state | Captured | Result |
|---|---|---|
| Disorder hold | `hero-disorder.png` (t≈2s) | Clustered network, sparse short edges — matches `hero-network.jpg` |
| Ordered hold | `hero-ordered.png` (t≈8.2s) | Radial spokes, transparent at centre — matches `hero-live.jpg` |
| Topology change | both above | Network edges fade out, spokes fade in. Position **and** topology transform, which was the acceptance criterion |
| Dark theme | `dark-fixed.png` | Full node density |
| Drag / release / offscreen pause | **not yet captured** | Implemented (pointer capture, `pointercancel`, `pow(0.93, dt·60)`, IntersectionObserver + `visibilitychange`, dt capped 0.05) but **not yet demonstrated** |

**Colour:** MODUS weighting, not the reference's orange/amber/olive — ~40%
ink plus the green family. The mandate explicitly forbids carrying that trio
over.

**Deliberate deviations, with reasons:**
- `pointScale` 1.3 desktop / 1.5 mobile. The spec base (0.05 × 1.6) renders a
  regular node at ~4px at this camera distance, which disappeared under the
  line work. Tier *ratios* are unchanged.
- Edge opacity ceiling 0.3 (from 0.5) and inter-cluster edges cut from 6% to
  2.5% of node count. At the spec'd density the graph read as the subject and
  the dots as decoration.
- Cluster spread reduced from ±1.8 to ±1.25 in x, so both states occupy a
  similar footprint; at ±1.8 the network sprawled off-viewport and the morph
  read as collapsing inward from offscreen.

**NOT IMPLEMENTED, named rather than omitted:**
- **Signal labels** — the projected one-at-a-time DOM overlay with the full
  leader/pill/type/erase timing. Not built.
- **Traveling packets and arrival rings** — secondary polish. Not built.

**Bug found and fixed by looking at a capture:** the WebGL fallback text
rendered *on top of* the live scene. Tailwind's `flex` utility overrides the
user-agent `[hidden] { display: none }` rule, so the `hidden` attribute did
nothing. Fixed with `[&[hidden]]:hidden`.

**Bug found and fixed:** ~40% of nodes carry the reference's dark ink, which
is invisible on the dark ground — the sphere read 40% sparser in dark mode.
Those nodes now flip to cream; the accent proportion is identical in both
themes.

## Checkpoint E — Real 3D stack — SUBSTANTIALLY COMPLETE

Real extruded geometry, orthographic `[0,0,1000]`, depth 320, front Z 160,
occlusion plane at Z −185 with hidden fronts at Z −240. One reversible
GSAP timeline, total 2.7 virtual units, `scrub: 0.6`, `power2.inOut`,
`start: "top top"`, `end: "bottom bottom"`. CSS sticky pins the scene column;
ScrollTrigger does **not** also pin it.

| Required state | Capture | Result |
|---|---|---|
| Entry | `stack-00-entry` | Team + Production only, flat; intermediates hidden |
| Early tilt | `stack-01-tilt`, `stack-02-layers` | **Side and back edges visible; panels emerge from behind the occluder** — the mandate's required proof |
| Layers revealing | `stack-02-layers` | Improvements, insight arriving |
| Categories entering | `stack-04-categories` | Identity panel present with the MODUS mark |
| Final flat | `stack-05-flat` | Complete flat front view, all five categories — matches `stack-end.jpg` |
| Reverse to entry | `stack-06-reverse-entry` | Entry geometry exactly restored by the same timeline |

Five business categories replace nine integration logos:
`(1272 − 4×20)/5 = 238.4` wide, `x = 120 + i×258.4`, outer alignment with the
1272-wide panels preserved. No third-party logo is used or implied.

**Two real bugs found by measurement, both fixed:**

1. **Boxes rendered see-through**, showing their own back edges, and the
   occlusion plane hid nothing. The body material was `transparent: true`, so
   it wrote no useful depth. Made opaque (plus `polygonOffset` so edge lines
   win the depth test cleanly).
2. **The final state never flattened.** `setSceneReady(true)` added
   `lg:hidden` to the flat fallback *after* `ScrollTrigger.refresh()` had
   measured the section, so the trigger kept stale, taller geometry and
   scrolling to the real bottom only reached ~0.8 progress — the 2.0→2.7
   flatten segment never ran. Found by measuring scroll position against
   section bounds. Fixed by removing the post-mount layout change entirely.

**Also fixed:** the scene built on mount rather than lazily, putting two
canvases at the top of the homepage. Now gated behind an IntersectionObserver
with `rootMargin: 60%`. There is no frame loop to pause — the scene renders
only from the scrubbed timeline's `onUpdate`, so it is genuinely idle when
not being scrolled through.

**Not yet verified:** fractional browser zoom, the 1023/1024/1025 breakpoint
edges, and sticky behaviour under a restored scroll position.

## Checkpoint F — Header, SplitText, buttons, Lenis — PARTIAL

| Item | Status |
|---|---|
| Centred logo collapse | **Done.** 220/110 hysteresis, bottom-160 expansion, 600ms `cubic-bezier(.65,0,.35,1)` on max-width/opacity/gap/padding, symbol always visible, centred via `translateX(-50%)` so neighbours never shift, rAF-throttled passive listener, ResizeObserver, initial state evaluated synchronously for restored scroll. Visible condensed in every stack capture. |
| Lenis | **Pre-existing and already correct** — one instance, `autoRaf: false`, `gsap.ticker` driving `lenis.raf(time*1000)`, `lagSmoothing(0)` once, reduced motion never constructs it. Lenis CSS import still to confirm. |
| SplitText masked reveal | **NOT IMPLEMENTED.** `data-split="heading"` attributes are in place on the hero and section-02 headings, but the init module is not written. Headings render fully visible, so nothing is hidden — the failure mode the mandate warns about is avoided by default. |
| Character-stagger buttons | **NOT IMPLEMENTED.** |
| Header progress ring | Not implemented (explicitly secondary polish). |

## Checkpoint G — Routes, themes, locales — PARTIAL

- EN/NL: all new copy added to **both** dictionaries (hero headline and
  lead, manifesto, section 02 steps and every diagram label). Smoke test
  asserting the headline changes between locales passes.
- Light/dark/system: verified on the homepage.
- `/app` and `/private` shells: **NOT MIGRATED.**
- Other marketing routes load clean but still carry the old visual language.

## Checkpoint H — Final comparison — NOT STARTED

No performance measurement has been taken, so no performance claim is made.

---

## Regression, current

`tsc` 0 errors. `eslint` 0 errors. Playwright **41 passed, 1 failed, 1
skipped** — the one failure is the pre-existing one proven against `643cfad`
above.

One test was rewritten rather than deleted: *"diagnostic route does not mount
the WebGL fluid field; homepage does"* asserted an architecture this rebuild
retired. It now asserts the same underlying invariant — the Diagnostic stays
free of decorative WebGL — scoped to the hero section so it does not break
when the stack's lazy threshold is retuned.

---

## Standing rules for this document

- Layout tolerances (2–4px positions, ~1% large dimensions) are comparison
  targets. No fabricated pass rate is reported.
- No whole-page 1:1 parity is claimed against `modusreff.png` or
  `foundationsandcomponents.png`; both are unfinished studies.
- No FPS or performance figure appears without a measurement and the
  conditions it was measured under.
- Secondary polish that is unfinished (hero packets and arrival rings, the
  header progress ring) is named as unfinished, not quietly omitted.
