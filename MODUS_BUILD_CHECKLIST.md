# MODUS Build Checklist

Section 11 of `MODUS-CLAUDE-CODE-MASTER-PROMPT.md`. Only verified items are
ticked — "written" is not "verified", and a passing build is not verification
of an interaction. Evidence lives in `MODUS_VALIDATION_REPORT.md`.

**Status: A complete. B complete. F complete (masked text reveals and
character-stagger buttons). C/D/E/G partial — see
`MODUS_VALIDATION_REPORT.md` for exactly what is and is not verified.
H not started.**

---

## Audit and reset

- [x] Repository instructions and existing user changes inspected.
- [x] Actual routes, handlers, providers, styles and motion dependencies mapped.
- [x] Existing functional baseline recorded; pre-existing failures separated.
- [x] Plan, checklist, visual-reset audit and validation report created.
- [x] New shell is used by the real entry routes.
- [ ] Old hero/blob presentation and conflicting CSS/theme/type/layout influence removed.
- [ ] Shared consumers migrated before obsolete styles/components are retired.
- [ ] No duplicate scroll/theme/animation providers remain.
- [ ] Surviving legacy presentation is listed with a concrete functional reason.

> Additional, not in the original list but required by what the audit found:
- [x] Version control established before any presentation edit (`643cfad`).
- [x] Secrets confirmed excluded from the baseline commit.

## Brand and foundation

- [x] Supplied MODUS symbol used; no invented substitute.
- [x] Green `#1E3B2E` and other new semantic tokens applied.
- [x] Licensed display font or explicit Noto Serif fallback loaded; Geist supporting type.
- [x] New light/dark/system styling and persisted preference verified.
- [x] Proportional scaling and readable responsive typography implemented.
- [x] Unfilled frames have dashed rules and four sharp solid corner brackets.
- [x] Active cards, CTAs, focus states and contrast match new design.

## Homepage and routes

- [x] Accessible responsive navigation and mobile menu.
- [x] Centred full/compact MODUS logo behaviour.
- [x] Hero copy, two-line desktop headline and real diagnostic CTA.
- [ ] Interactive sphere and accessible/static fallbacks.
- [x] Five-line manifesto and mobile recomposition.
- [x] Three-step section 02 and real desktop 3D stack.
- [ ] Capabilities, data showcase, FAQ, closing CTA and footer completed.
- [ ] Data/copy claims verified or visibly identified as draft/illustrative.
- [ ] Existing public information routes use new presentation.
- [ ] Diagnostic/auth/account/client/private shells updated within actual route scope.
- [x] Existing business behaviour, locale, cookies, analytics and access boundaries preserved.

## Hero motion

- [x] Buffered geometry, seeded QA and perspective sizing.
- [x] Six clusters and Fibonacci sphere target.
- [x] Exact 3/3/4/3s cycle with spatial morph ripple.
- [x] Network-to-spoke topology/alpha transition.
- [ ] Two-axis drag, normalized inertia and correct pointer cancellation.
- [ ] Auto rotation, sway, breathing and node lifecycle.
- [ ] Projected one-at-a-time signal labels with full timing/clipping.
- [ ] Packets and arrival rings completed **or specifically reported as incomplete**.
- [ ] Foreground CTA/mobile scrolling unaffected.
- [ ] Offscreen/hidden pause, DPR caps and GPU/listener cleanup.

## Stack motion

- [x] Orthographic scene, extruded 320-depth layers and MODUS identity texture.
- [x] Occlusion plane and actual hidden initial Z positions.
- [x] Production offsets 601→133→0 and auto centering.
- [x] Root tilt (−0.48, −0.36) and final flatten.
- [x] Main panels and category/tool row stagger at specified timeline positions.
- [x] Single 2.7-unit reversible timeline, start/end and scrub 0.6.
- [x] Tall story steps, nearest-center activation and CSS sticky without double pin.
- [ ] Resize/fonts/assets refresh and proper trigger cleanup.
- [x] Real forward/reverse screenshots show side edges and depth emergence.
- [ ] Mobile/reduced-motion/WebGL fallback complete and hidden canvas paused.

## Header and PDF motion

- [x] Header 220/110 hysteresis, bottom 160 expansion and restored-scroll state.
- [x] Logo 600ms easing, width/opacity/gap collapse, symbol retained and centre fixed.
- [x] SplitText line masks, minimum required splitting and returned `onSplit` tween.
- [x] Correct durations/staggers/start/ease; fonts/locale/resize cleanup.
- [x] No hidden text after plugin failure/no-JS/reduced motion.
- [x] Button character delay 0.01s and 1.3em replacement motion.
- [x] Background inset, focus-visible, grapheme/space handling and disabled/loading semantics.
- [ ] Osmo scaling implemented through deliberate units, not ineffective body font-size alone.
- [ ] Breakpoint/zoom/minimum readability checks.
- [x] One Lenis instance and one clock; GSAP synchronization and imported CSS. *(pre-existing and already correct — verified in `LenisProvider.tsx`; CSS import still to confirm)*
- [ ] Nested scroll/modal lock/anchor/route restoration behaviour verified.

## Release readiness

- [ ] Desktop 1440, mobile 390, tablet, wide desktop and breakpoint-edge checks.
- [ ] EN/NL, light/dark/system and reduced-motion checks.
- [ ] Keyboard/focus/screen-reader semantics and real diagnostic journey checked.
- [ ] Required tests/type/lint/build completed; failures accurately reported.
- [ ] No unexpected horizontal overflow, clipped content or persistent console errors.
- [ ] Motion teardown/remount/context/fallback behaviour checked.
- [ ] Actual screenshot/overlay/motion evidence saved.
- [ ] Performance measured rather than asserted.
- [ ] Final visual-reset audit confirms no competing old design remains in migrated routes.
- [ ] Final status reflects remaining work; no deployment without authorization.
