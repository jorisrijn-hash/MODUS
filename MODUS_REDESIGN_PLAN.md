# MODUS Master Redesign V2 — Plan

Written at Checkpoint 0, per the "MODUS MASTER WEBSITE REDESIGN / VISUAL
SYSTEM V2" brief (received 2026-09-30, queued entry in `BRIEF_CHECKLIST.md`).
This document is the required Section-0 deliverable: an inventory of what
exists, what must survive, and the checkpoint plan for what comes next.

Scope: the **public marketing site** — `/`, `/how-it-works`, `/platform`,
`/capabilities`, `/results`, `/company`, `/diagnostic`, `/pricing`, plus
shared nav/footer/cookies/i18n/SEO. `/app` (client dashboard) and `/private`
(admin console) are explicitly out of scope for visual change, per the
brief's own Section 40, though a shared theme/token foundation is a
candidate for later, careful propagation (see "Theme architecture" below).

---

## 1 — Existing route inventory

37 total Next.js routes, all server-rendered dynamically (`ƒ`, no static
routes at all — see "Known pre-existing gaps" below for why).

**Public marketing (this redesign's scope):**
| Route | Purpose |
|---|---|
| `/` | Homepage — positioning, Business X-Ray, process, proof, pricing teaser, final CTA |
| `/how-it-works` | Process/methodology explainer |
| `/platform` | Product/platform teaser — MODUS Brief, Ask MODUS demo, Client Day, platform mockup tabs |
| `/capabilities` | Service/capability breakdown |
| `/results` | Case studies / proof |
| `/company` | About/company page |
| `/pricing` | Pricing bands + estimate CTA |
| `/diagnostic` | The Free Diagnostic flow — see Section 5 below, this project's primary conversion path |

**`/app` (client dashboard, out of scope, protect):**
`/app`, `/app/login`, `/app/verify`, and 11 routes under
`/app/(dashboard)/*` (overview, performance, actions, signals, leads,
campaigns, website, reports, support, settings + 3 settings sub-pages).
Own auth (`useSessionStage`, mocked OTP), own shell (`AppShell.tsx`), no
route-level layout of its own — mounts inside the **same root layout** as
the marketing site (see "Shared root layout" risk below).

**`/private` (admin console, out of scope, protect):**
`/private`, `/private/login`, `/private/(app)/{diagnostics,diagnostics/[id],pipeline,settings}`.
Real server-side auth (`iron-session`), own layout guard.

**API routes:** `/api/diagnostic` (public submission), `/api/context/[token]`
+ `/callback` (personalization), `/api/private/*` (admin, session-gated).

**Other:** `/proposal/[token]` (token-gated proposal view, part of the
personalization/conversion system — see Section 6).

## 2 — Shared components and layouts

- **Root layout** (`src/app/layout.tsx`): the single `<html>`/`<body>` for
  the *entire app* — marketing, `/app`, and `/private` all mount inside it.
  Providers, in order: `LocaleProvider` → `OverlayProvider` → `MotionProvider`
  → `Loader` → `{children}` → `Chatbot` → `LanguagePrompt` → `ConsentBanner`,
  then `SystemNotificationHost` and a fixed `.grain-overlay` div outside
  `MotionProvider`. **This is the key architectural fact for the "share
  theme without coupling visual experience" question** — see Section 8.
- **Layout primitives**: `Container` (`max-w-[1760px]`, page content),
  `WideBleed` (`max-w-[2000px]`, nav/footer chrome). Both are simple,
  dependency-free wrapper divs — safe to keep and extend with a grid system.
- **`Navigation.tsx`**: single component, no separate mobile-nav file for
  marketing (unlike `/app`, which has its own `MobileNav.tsx`). Scroll-aware
  height/blur, a dropdown-style (not full-screen) mobile menu, and a
  **dynamic CTA** — see Section 6, this is load-bearing personalization
  logic, not a static "Free Diagnostic" label.
- **`FooterReveal.tsx` + `Footer.tsx`**: genuine `position: sticky` reveal
  (CTA layer lifts away via scroll-linked `useTransform`, not a fake blank
  scroll spacer) — already a "deliberate final composition," a good
  foundation to extend rather than replace outright.
- **`ui/` primitives**: `Logo`, `Container`, `MagneticButton`, `HoldToConfirm`,
  `Reveal`, `TextReveal`, `RotatingLine`, `NumberTicker`, `SectionLabel`,
  `BeforeAfterMetric`, `FieldPhoto`, `WarpField` (see Section 4).
- **`sections/`**: 36 marketing page-section components (homepage story
  pieces, pricing sections, platform mockup/panels, etc.) — page-specific,
  not shared primitives.
- **`system/`**: `OverlayProvider` (priority queue: consent →
  consentPreferences → diagnosticRecovery → languagePrompt) +
  `SystemSurface` (the shared datum/line/plane reveal shell used by all
  floating system prompts) — a solid, reusable pattern; the theme switcher
  and any new environmental UI should consider reusing `SystemSurface`'s
  reveal language rather than inventing a new one.

## 3 — Typography, color, spacing (current system)

- **Fonts**: `Inter` (`--font-sans`) + `IBM Plex Mono` (`--font-mono`), both
  via `next/font/google`, loaded once in root layout — applies everywhere,
  including `/app`/`/private`.
- **Color** (`tailwind.config.ts`): flat hex tokens, not CSS custom
  properties — `paper #FAFAF8`, `mineral #F4F4F0`, `surface #EBEBE5`,
  `ink #151716`, `graphite #262A28`, `muted #70756F`, `line #D9DCD7`,
  `modus.{DEFAULT #123C2D, light #1B5A43, dim #0D2B20}`, `signal #E03A2E`.
  Sourced from "MODUS Brand Style Guide v1.0" (comment in the config points
  back to it). **These are the values the brief's Section 8 says must
  survive** ("keep the existing MODUS brand accent color... build around
  existing MODUS accent, near-black, off-white, controlled neutral greys").
- **Type scale**: three named sizes only — `display-lg` (72/80, -0.02em),
  `display-md` (48/56, -0.01em), `display-sm` (32/40, 0em) — plus ad hoc
  Tailwind text sizes used directly in components (no systematic scale
  below H3). No `clamp()`/fluid sizing anywhere yet.
- **Spacing**: no custom spacing tokens — plain Tailwind spacing scale used
  ad hoc per component/section. No section-level rhythm tokens.
- **Border radius**: small, restrained scale (0/2/3/4/6px) — consistent
  with the brand's "not a generic SaaS" restraint; a redesign should not
  reach for large rounded-corner card aesthetics.
- **11 files bypass the Tailwind token layer** with raw hex (mostly SVG
  `stroke`/`fill` attributes, which can't take Tailwind classes directly):
  `ModusScore.tsx`, `Sparkline.tsx`, `HeroOrbitalSystem.tsx`,
  `PlatformPanels.tsx`, `SystemMap.tsx`, `ReviewScreen.tsx`, `FieldPhoto.tsx`,
  `Logo.tsx`, and three `/app` dashboard pages. **These will not
  automatically respond to a dark-mode class strategy** and need explicit
  attention (converting to CSS custom properties) in Checkpoint 1 if a
  faithful dark mode is required in the areas they appear.

## 4 — Existing animation/motion code

- **Only `motion/react` (Motion for React) is currently used** — no GSAP,
  no Lenis, no React Three Fiber/WebGL anywhere in the dependency tree or
  codebase today. All three are genuinely new additions for this brief.
- **`MotionProvider`**: a single `<MotionConfig reducedMotion="user">`
  wrapping the whole app — this makes most `motion.*` component
  animations auto-respect OS-level reduced-motion for free. It does
  **not** cover plain-JS animation logic (rAF loops, canvas/WebGL
  render loops, imperative timelines) — those need their own explicit
  check, which is exactly what the project's own hook below is for.
- **`usePrefersReducedMotion()`** (`src/lib/usePrefersReducedMotion.ts`):
  the project's own `useSyncExternalStore`-based hook, written specifically
  because `motion/react`'s own `useReducedMotion()` was found (this
  session, documented in its own code comment) to cause a real hydration
  mismatch bug on `Loader.tsx`. **Established convention going forward.**
- **Inconsistency found, not yet fixed** (flagged per the brief's own
  request to identify — not remove — code that shouldn't survive
  unchanged): 6 files still call `motion/react`'s own `useReducedMotion()`
  instead of the project's hook — `Chatbot.tsx`, `ConsentPreferencesDialog.tsx`,
  `SystemSurface.tsx`, `HoldToConfirm.tsx`, `RotatingLine.tsx`,
  `WarpField.tsx`. None of these have a *confirmed* live bug the way
  `Loader.tsx` once did, but they carry the same risk class. Worth a
  dedicated pass (likely folded into Checkpoint 2, since that's where the
  shared motion/reduced-motion architecture gets formalized) rather than
  fixed piecemeal now.
- **A hard global CSS rule already exists**: `globals.css`'s
  `@media (prefers-reduced-motion: reduce)` block forces `animation-duration`
  /`transition-duration` to `0.01ms` on every element. This only touches
  CSS animations/transitions — it has **no effect on GSAP timelines, Lenis
  scroll, or a WebGL render loop**, all of which will need their own
  explicit reduced-motion branches. This is the single biggest
  "won't just work for free" fact for Checkpoint 2's planning.
- **`WarpField.tsx`** is the closest existing thing to the reference's
  "warp"/distortion effects — a real SVG `feTurbulence`/`feDisplacementMap`
  transform-origin scale effect, built and documented as a from-scratch
  MODUS interpretation (the actual Motion.dev warp-overlay reference
  implementation was inaccessible, paid/gated — documented honestly at the
  time). Worth reviewing as a candidate building block or reference point
  for the new fluid-field work, not a nice-to-delete piece of debt.
- **The banned pattern is absent**: grepped for `AnimatePresence
  mode="wait"` — zero occurrences. `DiagnosticShell.tsx` correctly uses
  `mode="popLayout"`.

## 5 — The Free Diagnostic: CTAs, flow, validation, state, submission

**Every existing CTA location** (8 total, all resolving to `/diagnostic`,
grepped directly rather than assumed):
`Navigation.tsx` (dynamic label, see Section 6), `Hero.tsx` (same dynamic
label), `FinalCTA.tsx`, `Footer.tsx`, `HomeContextBanner.tsx` (×2, for
returning visitors), `PricingHero.tsx`, `PricingEstimateCTA.tsx`. All must
keep working exactly as CTAs (destination, and where relevant, the
personalized label logic) through the redesign.

**Flow architecture** (`DiagnosticShell.tsx`, client-only via a dynamic
`ssr:false` import on `/diagnostic/page.tsx`): a single component state
machine — `Screen = "intro" | "form" | "review" | "submitting" | "result" |
"profile"` — 6 form steps (`StepBusiness` → `StepOperations` →
`StepSystems` → `StepFriction` → `StepPriorities` → `StepContact`), each
gated by a `canProceed(step, answers)` function mirrored client-side (UI
gating) and server-side (`/api/diagnostic`'s Zod schema, using the *same*
validator functions from `src/lib/diagnostic/schema.ts` — email regex,
phone via `libphonenumber-js`, name/company/website normalization, a
disposable-email note, word-count-bounded free text). State persists to
`sessionStorage` (`modus:diagnostic:v1`) on every change while on the
`form` screen, enabling the existing resume-prompt (`DiagnosticRecoveryPrompt`)
on return. Submission computes a deterministic pricing estimate
(`calculateEngagementEstimate`, no LLM) server-side and returns a
`contextToken` that feeds the site-wide personalization system (Section 6).
A honeypot field (`website2`) and analytics events (`diagnostic_started`,
`diagnostic_step_completed`, `diagnostic_submitted`,
`diagnostic_submit_failed`, `diagnostic_abandoned` on `beforeunload`) are
also part of this flow's real behavior, not incidental.

**All of this must survive completely intact** per the brief's Section 3 —
the redesign changes *presentation* only (transitions, question layout,
progress indicator styling, fluid-field response to selections), never the
schema, gating logic, storage key, submission contract, or analytics events.

## 6 — Personalization / other conversion flows

Beyond the Diagnostic itself, there's a working **returning-visitor
personalization system** (`src/lib/customerContext/`) that the redesign
must not break: `nextBestAction.ts` derives one of `RUN_DIAGNOSTIC` /
`CONTINUE_DIAGNOSTIC` / `VIEW_PROFILE` / `VIEW_PROPOSAL` from stored
context, and both `Navigation.tsx` and `Hero.tsx` render a **different CTA
label and (for proposals) a different destination** depending on it —
this is real, tested behavior (`customerContext.spec.ts`, 5 Playwright
scenarios, all currently passing), not just a static "Free Diagnostic"
button. Any visual nav/hero redesign must preserve this branching, not
hardcode a single CTA string. `HomeContextBanner.tsx` is a second surface
for the same system. `/proposal/[token]` is a separate token-gated view
tied into the same personalization loop. A `CalendlyEmbed` exists but is
only used inside `/private`'s admin review-scheduling panel, not a public
conversion surface.

## 7 — i18n / EN-NL architecture

Cookie-based (`modus_locale`), no URL segments — `getInitialLocale()`
reads the cookie server-side in root layout (`generateMetadata` and the
`<html lang>` attribute both depend on this, which is *why* every route is
currently dynamically rendered rather than static — see Section 11).
Client-side `LocaleProvider`/`useDict()` context, dictionaries in
`src/lib/i18n/dictionaries/{en,nl}.ts`. Server always defaults to English;
switches only on an explicit user action (manual switch or the one-time
browser-language-detected prompt) — never from `Accept-Language` alone.
**Any new copy this redesign introduces must go through this dictionary
system from the start**, not get hardcoded English (a mistake made once
already earlier in the project's history and fixed then, per this file's
own past entries). A new theme cookie should very likely follow the
identical architecture (own cookie name, read server-side in root layout,
its own small provider) for consistency, not a different mechanism.

## 8 — Cookie / privacy functionality

`src/lib/privacy/consent.ts`: versioned (`CONSENT_VERSION`) localStorage
state, `necessary` (always on) / `analytics` / `marketing` categories,
`ConsentBanner.tsx` (Accept All / Reject Optional / Manage, equally
prominent) + `ConsentPreferencesDialog.tsx` (Radix Dialog). Self-suppresses
only on `/private` (checked directly — **not** on `/app`, see the
important flag in Section 9 below). Must be restyled to the new visual
system, not functionally touched — `needsConsentDecision()`/`saveConsent()`
contracts must stay exactly as-is since nothing downstream depends on their
shape changing.

## 9 — SEO / metadata / theme boundary risk — a real pre-existing gap worth fixing as part of this work

Per-route `generateMetadata` exists on 6 of 8 marketing routes (missing:
homepage uses root metadata only by inheritance, and `/pricing`'s is
English-only per an already-documented gap) — not a V2 problem to solve
from scratch, but worth folding into Checkpoint 8 since the redesign
touches every one of these pages anyway. **No `robots.txt` or
`sitemap.ts`/`.xml` exists anywhere in the project** — a genuine gap,
independent of the redesign, worth a one-line fix while in this area.
`siteUrl` in root layout is still the literal placeholder
`"https://modus.example.com"` — flag for the user before this ever
matters for real (OG/canonical URLs are currently wrong for a real
deployment); not this session's decision to silently change.

**The more important finding, directly relevant to the brief's Section 40
("protect `/app`")**: none of the root-mounted global overlay components —
`Chatbot`, `LanguagePrompt`, `ConsentBanner`, `Loader` — check for `/app`
in their pathname-suppression logic. All four currently only exclude
`/private`. This means the marketing chatbot trigger, language-detection
prompt, and consent banner can **already** mount on top of `/app` dashboard
screens today, before any V2 work — a pre-existing gap, not something V2
introduces. **This is exactly the pattern any new Lenis/GSAP/WebGL provider
must follow and should not repeat the same gap in**: Checkpoint 2/3's
provider components need an explicit `pathname?.startsWith("/app")` (in
addition to `/private`) exclusion from day one, and it's worth a one-line
fix to the four existing components while touching this code regardless,
even though it's a pre-existing bug rather than a new one introduced by V2.

## 10 — Current theme/dark-mode architecture

**None exists.** Confirmed three independent ways: `globals.css` hardcodes
`color-scheme: light`; `tailwind.config.ts` has no `darkMode` key
configured at all; a repo-wide grep for `dark:` Tailwind variants returns
zero real matches (the one hit was a `dark:` object-key string in
`Logo.tsx`, unrelated to Tailwind). Building light/dark/system from
scratch is a Checkpoint 1 task, not an extension of anything existing.
See Section 3 for the 11 files whose raw hex values will need to become
CSS custom properties for a faithful dark mode to reach them.

## 11 — `/app` architecture and the shared-foundation question

`/app` has **no route-level layout of its own** — `AppShell.tsx` is a
plain client component mounted directly by each dashboard page, and the
whole `/app` tree renders inside the **same root `layout.tsx`** as the
marketing site and `/private`. This is the central fact for "how do
marketing and `/app` eventually share theme without coupling their visual
experience":

- A **theme system** (CSS custom properties + a cookie/localStorage
  preference + a `ThemeProvider`) belongs at the root layout level exactly
  like `LocaleProvider` already sits — both marketing and `/app` benefit,
  neither is coupled to the other's *content*.
- A **Lenis/GSAP/WebGL/cinematic-motion provider**, by contrast, must
  **not** sit at root. It needs to mount only around the marketing route
  group, the same way `Loader`/`Chatbot`/`ConsentBanner` already
  self-suppress by pathname today (imperfectly, per Section 9) — or,
  more robustly, by introducing a real Next.js route group
  (`src/app/(marketing)/...`) with its own layout wrapper, so the
  exclusion is structural rather than another pathname string check that
  can be forgotten on the next new provider. **This is a Checkpoint 1/3
  architecture decision, not a Checkpoint 0 one** — flagged here for
  visibility, recommendation below.
- `/app` already has its own hardcoded `bg-mineral` background and its own
  component-level color choices (Section 3's 11-file list includes 3
  `/app` pages) — a shared token layer (`--canvas`, `--surface`, etc.)
  would let `/app` opt into the same *palette* later without inheriting
  any of the marketing site's motion.

## 12 — Dependencies and potential conflicts

Current stack: Next.js 16.3.3 (Turbopack), React 19.2.8, **Tailwind CSS
v3.4.17** (not v4 — the brief's reference stack assumes Tailwind v4's
CSS-first `@theme` config; this project is still on the v3 JS-config
model). `motion` 11.15.0 already present. No GSAP, Lenis, or
`@react-three/fiber`/`three` anywhere in `package.json` or `node_modules`
today — all three are genuinely new installs, not upgrades.

**Known integration risks, not yet resolved (flag for Checkpoint 1/2
approval, not blocking Checkpoint 0):**
- **Tailwind v3 vs. v4**: the brief's reference project assumes v4. Two
  paths: (a) stay on v3 and hand-author `@theme`-equivalent tokens the
  old way (lower risk, no dependency-version churn, everything else in
  the project stays untouched), or (b) upgrade to Tailwind v4 first as
  its own isolated step before any visual work (higher risk/effort, but
  matches the reference's actual authoring model and gets the smaller
  v4 runtime + native cascade layers). **Recommend (a)** — nothing in the
  brief requires v4 specifically, only the token *architecture* (semantic
  CSS custom properties) it describes, which is achievable in v3 today.
- **Lenis + Next.js App Router + `usePathname`/scroll restoration**: Lenis
  takes over the scroll container; Next's own scroll-restoration-on-navigate
  behavior and the existing `scroll-padding-top` / `scroll-behavior: smooth`
  rules in `globals.css` need to be reconciled with it, not layered
  underneath it unmodified.
- **GSAP ScrollTrigger + React 19 Strict Mode**: `next.config.ts` has
  `reactStrictMode: true` (intentional, already in place) — Strict Mode's
  double-invoke-effects-in-dev behavior is a known source of duplicate
  ScrollTrigger registration/duplicate-listener bugs if instances aren't
  created and torn down carefully inside `useEffect` cleanup. Needs
  deliberate handling in Checkpoint 2, not an afterthought.
- **React Three Fiber**: would pull in `three` (a large dependency) purely
  for a cursor/fluid-field effect. Worth deciding in Checkpoint 2 whether a
  full R3F canvas is justified versus a lighter raw WebGL2 shader (no R3F
  scene graph overhead) for what's fundamentally a single 2D fluid-simulation
  effect — R3F's ecosystem benefits (declarative scenes, drei helpers) matter
  more for 3D scenes than a full-viewport 2D shader pass. Recommend
  evaluating both bundle-size options concretely in Checkpoint 2 rather than
  defaulting to R3F because the reference used it.
- No current conflict found between React 19 / Next 16 and GSAP/Lenis
  themselves — both are framework-agnostic and commonly used with the App
  Router; the risks above are about *this project's* existing patterns
  (Strict Mode, cookie-driven dynamic rendering, Motion's own reduced-motion
  handling), not fundamental incompatibility.

## 13 — Responsive/mobile architecture

Responsive today is "the same components, response via Tailwind
breakpoints" — no separately-composed mobile layouts anywhere yet (this
gap is already self-documented in `BRIEF_CHECKLIST.md`'s "Phase G — Polish:
not started" section from earlier in the project). The brief's Section 35
explicitly wants intentionally-recomposed (not just stacked) mobile
layouts — this is new work, not a preservation concern, for Checkpoints
4–9. `e2e/responsive.spec.ts` already covers 4 breakpoints (1440×900,
1920×1080, 768×1024, 390×844) with horizontal-overflow assertions across
home/pricing/diagnostic/private-login — a good existing regression harness
to extend to every newly redesigned page rather than rebuild.

## 14 — Performance risks specific to this redesign

- Bundle: current `.next/static/chunks` is ~3.1MB baseline (see Checkpoint
  0 baseline numbers in `MODUS_REDESIGN_REPORT.md`) with only Motion as an
  animation dependency. GSAP (~30-70KB depending on plugins used), Lenis
  (~5KB), and especially Three.js/R3F (100KB+ minified) will meaningfully
  grow this — needs route-level code-splitting (dynamic imports, `next/dynamic`
  with `ssr: false` for anything WebGL/canvas-based, matching the existing
  precedent of `/diagnostic/page.tsx`'s own `ssr:false` dynamic import)
  rather than a blanket root-layout import.
- The site is **already fully dynamic-rendered** (locale cookie read in
  root layout forces this site-wide) — a pre-existing, already-documented
  tradeoff, not something V2 causes, but worth keeping in mind: there's no
  static-generation performance cushion to lean on anywhere already.
- WebGL fluid-field lifecycle: must pause on tab-hidden
  (`document.visibilitychange`), dispose GPU resources on unmount, and
  degrade on touch devices per the brief's own Section 17 — no existing
  precedent for this in the codebase (WarpField is SVG-filter-based, not
  raw WebGL), so this is genuinely new engineering, not an adaptation of
  something already proven here.
- GSAP ScrollTrigger instances must be `.kill()`ed on route change/unmount
  — Next's client-side navigation won't do this automatically, and there's
  no existing pattern in this codebase for "cleanup on route change" beyond
  standard `useEffect` cleanup (which does cover unmount, just flagging
  that this needs to actually happen, not be assumed).

## 15 — Existing code that should not survive V2 unchanged (flagged, not removed)

Per the brief's explicit request to identify but not yet touch:

1. **Reduced-motion hook inconsistency** (Section 4) — 6 files use
   `motion/react`'s own `useReducedMotion()` instead of the project's
   `usePrefersReducedMotion()`. Same risk class as the confirmed
   `Loader.tsx` bug from earlier in the project, just not yet proven to
   have manifested in these 6.
2. **`/app` isn't excluded from marketing-only global overlays** (Section
   9) — `Chatbot`, `LanguagePrompt`, `ConsentBanner`, `Loader` all only
   check `/private`, not `/app`. Directly relevant to protecting `/app`
   from the new cinematic motion layer — should be fixed as part of
   whichever checkpoint introduces the new marketing-only providers, so
   the mistake isn't repeated a fifth time.
3. **`siteUrl` placeholder** (`"https://modus.example.com"`) in root
   layout — not a V2 concern per se, but if metadata/OG work happens in
   Checkpoint 8 this will surface and shouldn't be "fixed" silently
   without the user's sign-off on the real production domain.
4. **No `robots.txt`/`sitemap.ts`** — same category, flag rather than
   silently add.
5. **Tailwind v3, not v4** — not "wrong," but a decision point (Section
   12) the brief's own reference implicitly assumes is already resolved
   in the other direction.

None of the above are blocking Checkpoint 1 — they're documented so
they're deliberate decisions in later checkpoints rather than silent
side effects.

## 16 — Proposed architecture for Checkpoint 1 onward

- **Token layer**: introduce semantic CSS custom properties
  (`--canvas`, `--canvas-secondary`, `--surface`, `--surface-elevated`,
  `--text-primary`, `--text-secondary`, `--text-muted`, `--line`,
  `--line-strong`, `--accent`, `--accent-soft`, `--fluid-primary`,
  `--fluid-secondary`, `--selection`) defined in `globals.css` under
  `:root` (light) and `:root[data-theme="dark"]` + a `prefers-color-scheme`
  media-query fallback for "system," mapped into `tailwind.config.ts` via
  `colors: { canvas: "var(--canvas)", ... }` so existing utility classes
  keep working with real values substituted underneath — existing
  components using `bg-paper`/`text-ink`/etc. don't need to be
  rewritten wholesale; the token *values* they resolve to change per theme,
  not their call sites, for anything already using Tailwind classes rather
  than raw hex. This directly minimizes churn to the existing ~150+
  component files that already use `paper`/`ink`/`graphite`/`modus`/etc.
  Tailwind classes.
- **Theme persistence**: mirror the existing locale-cookie architecture —
  a `modus_theme` cookie, read server-side in root layout (`getInitialTheme()`
  alongside `getInitialLocale()`), a `ThemeProvider` client context
  parallel to `LocaleProvider`, `<html data-theme={...}>` set both server-
  and client-side to avoid a flash. Respect `prefers-color-scheme` when the
  stored preference is "system."
- **Motion/WebGL scoping**: introduce a `(marketing)` route group
  (`src/app/(marketing)/page.tsx`, `/how-it-works/page.tsx`, etc.) with its
  own layout wrapping `Lenis`/GSAP context providers, so `/app` and
  `/private` are structurally excluded rather than relying on another
  pathname check — this also gives Checkpoint 3 a single place to mount
  the fluid-field canvas once, rather than per-page.
- **Reuse before invent**: `Container`/`WideBleed` for grid, `SystemSurface`
  for any new environmental overlay language, `WarpField`'s displacement-
  filter technique as a reference point for the fluid cursor's visual
  quality bar, `Reveal`/`TextReveal` as the base to extend into the
  brief's REVEAL/MORPH/FOCUS motion categories rather than parallel
  new primitives.

## 17 — Checkpoint list (adopted from the brief as-is; no deviation needed)

0. Audit + Baseline — **this document, done**
1. Design System Foundation (tokens, theme, type, spacing, grid, base
   components)
2. Motion + WebGL Foundation (Lenis, GSAP, fluid field, reduced-motion
   architecture, in an isolated test/demo area first)
3. Global Shell (nav, mobile nav, footer, theme switch, cookie dialog
   restyle, route-group scoping)
4. Homepage
5. Diagnostic (visual only, zero functional change)
6. Core content pages (How It Works, Platform, Capabilities)
7. Cases/Results
8. Pricing, Contact, secondary public pages, SEO gaps folded in
9. **Account & Persistence Foundation** (new, requirement received
   2026-09-30 — see `BRIEF_CHECKLIST.md`'s "MODUS MASTER WEBSITE REDESIGN
   / VISUAL SYSTEM V2" section for the full spec). Production
   authentication (Clerk, evaluated against Supabase Auth) + user-owned
   data persistence (Supabase), a free MODUS account distinct from `/app`
   client access, diagnostic save-to-account, a signed-in public-site
   state, and the auth/signup/reset/verify screens themselves (split-
   screen V2 visual shell). Placed here — after the visual redesign of
   every public page is done (Checkpoints 1–8) so the auth shell and
   signed-in nav state are built against the *final* V2 design system and
   Navigation/Footer, not against ones still due to change, and before
   the final responsive/performance/regression passes below so those
   passes cover the auth surfaces too, not just the marketing pages.
   Explicitly does not replace `/app`'s existing mock login/OTP yet —
   that migration is its own documented step within this checkpoint, not
   assumed to happen automatically. Numbered 9 in this list; was
   previously "Responsive + accessibility pass" before this requirement
   arrived — renumbered below, not dropped.
10. Responsive + accessibility pass
11. Performance + full regression + polish

Each checkpoint ends with a `MODUS_REDESIGN_REPORT.md` update and an
explicit stop for approval, per the brief.

## 18 — Known risks worth naming once, up front

- **No project-scoped git safety net**: `/Users/joris/dev/modus` has no
  `.git` of its own — the actual git root is `/Users/joris` (a broader
  personal repo covering multiple unrelated projects, confirmed via
  `git rev-parse --show-toplevel`). Every file change across all 11
  checkpoints is a real, permanent filesystem operation with no scoped
  `git revert` available for just this project. Already flagged to the
  user once earlier in this project's history; repeating here since an
  11-checkpoint, multi-week-scale redesign is exactly the kind of work
  where that matters most.
- **Scope discipline**: this is the largest single brief this project has
  received. The checkpoint-and-stop structure is the main defense against
  scope creep or an unreviewable mega-diff — worth actually honoring the
  stop points even under momentum.
- **Two independent theme-system requests exist** (this brief, site-wide;
  the earlier-queued "MODUS Dashboard V2" brief, `/app`-scoped Settings) —
  building the token/cookie/provider layer once, here, and letting the
  `/app` Settings theme toggle consume the *same* system later, avoids
  building two incompatible theme implementations back to back.
