# MODUS — project status

Updated after each task. Separates **code complete**, **dashboard
configured** and **connected and verified** — they are not the same thing.

Last updated: 2 October 2026.

---

## Deployment readiness: DEPLOYED (3 October 2026)

8 commits unpushed. The previous blocker is resolved.

**Previously:** a production server with no Clerk keys returned 500 on `/`
and `/diagnostic`. **Now,** measured with no environment at all:

| Route | Result |
|---|---|
| `/`, `/diagnostic`, `/pricing`, `/legal`, `/privacypolicy` | **200** |
| `/sitemap.xml`, `/robots.txt` | **200** |
| `/private`, `/private/diagnostics` | **307** to login |
| `/api/private/diagnostics` | **401** `{"error":"Unauthorized."}` |

So a misconfigured deployment degrades instead of going down, and the
protected surfaces fail closed rather than opening. Production keys being
present makes it better, not merely functional.

Readiness detail in §4.

---

## 1. Verified — measured, not asserted

| Area | Evidence |
|---|---|
| Postgres migration | All 4 original diagnostics in Supabase, **0 missing** (compared against the export by id). Importer idempotent: a second run inserts 0. |
| Orphaned rows | 347/356 activity events and 2/3 notes referenced deleted diagnostics (SQLite does not enforce FKs). Excluded, written to `prisma/export/orphaned-rows.json`, never silently dropped. |
| RLS — SQL layer | On the live Supabase DB: **10/10** app tables, 10 policies. Owner sees own row; other signed-in user **0**; anon **denied**; admin sees all 4; `AdminMember` denied to ordinary accounts; planting a row owned by someone else **rejected**; editing submitted answers affects **0 rows**. |
| RLS — browser path | Through Supabase PostgREST with a **genuine development** Clerk session token: anon denied on `Diagnostic`/`AdminMember`/`Profile` (`42501`); authenticated user saw **exactly 1** owned record with guest and other-user rows hidden. Test ownership reverted; all 4 originals are guest/unowned again. |
| Migration history | `public._prisma_migrations`: RLS on, **0 policies** (deny-all), grants only `postgres`/`service_role`, `anon` and `authenticated` both denied. Now applied by a repeatable, idempotent migration, not by hand. `prisma migrate status` against Supabase: 4 migrations, up to date. |
| Idempotent submission | Same `Idempotency-Key` twice → one row, same id and `contextToken`, `deduplicated: true`. |
| Notification enqueue | One outbox row per submission, recipient `hello@withmodus.co`, enqueued only **after** commit. |
| Authorization logic | 9 unit tests: anonymous → 401; signed-in without membership → 403; membership query always filters `revokedAt: null`; client entitlement is a separate lookup and never implies admin; guest records never match an ownership check. |
| Environment isolation | Dev server, Playwright and Prisma CLI all target local Postgres; only the two Supabase scripts read `.env.supabase.local`. |
| Regression | 45 Playwright passed / 1 failed / 1 skipped + 9 vitest. The single failure is pre-existing, proven by reproducing it on baseline `643cfad`. |

---

## 2. Configured in a dashboard but NOT verified in the app

Configuration is not evidence of working behaviour.

- **Clerk production instance** (`clerk.withmodus.co`), DNS, JWKS, Supabase trust for the production issuer. No production token has been exercised against PostgREST — all browser-path evidence so far uses the **development** issuer.
- **Google sign-in**: OAuth client created, Clerk shows enabled, audience in **Testing** with `withmodus@gmail.com` as the sole test user. **Never signed in through the deployed app.**
- **Resend**: domain `notifications.withmodus.co` and keys reported configured. **No mail has been sent or received.**
- **Vercel variables**: names recorded in `MODUS_PROVIDER_SETUP.md`. Values not inspected.

---

## 3. Known limitations and risks

- **Application-enforced MFA is intentionally deferred** (user decision, 2 Oct 2026). `ADMIN_MFA_REQUIRED` defaults to false. The enforcement path is retained and tested so enabling it is a one-line change. Google two-step verification protects the Google login only and is **not** application-enforced MFA. This is a recorded limitation, never to be reported as implemented or as verified.
- **No admin exists yet.** No production Clerk identity has been verified or granted. Signup grants nothing.
- **Preview shares the production database** per the latest Vercel screenshot. Do not run destructive fixtures or cleanup against it.
- ~~**The Clerk admin path is not wired to any route.**~~ **Resolved** —
  `/private` and every private API now run on Clerk plus `AdminMember`;
  the password mechanism is deleted. See §11.
- **GitHub sign-in is offered but unconfigured** on the auth screens. A
  Clerk dashboard setting, not code — disable it in Clerk Production or it
  presents a broken path. See §14.
- **Live notification retry is unverified** — with no mail provider the
  worker skips rather than attempts, so no real failure path runs. Backoff
  and give-up bounds are covered at unit level only. See §10.
- **Diagnostic graphic — all stages active and verified through the real
  journey.** See §9 for the evidence and the two remaining limitations.

  | Stage | State |
  |---|---|
  | Entry sphere | **Active**, desktop ≥1024px |
  | Topic layers (question stages) | **Active**, desktop ≥1024px |
  | Review stack (review / submitting / submit error) | **Active**, desktop ≥1280px |
  | Mark closure (result / profile) | **Active**, result ≥1280px, profile ≥1024px |

  The earlier note here said these were unmounted because running the
  scene through the question and submit screens destabilised submission.
  That was a misattribution: the cause was a stale-coordinate race in the
  test harness (§8), not the scene. With it fixed, the full journey runs
  with the scene mounted throughout, and the sticky-panel occlusion is
  resolved rather than tolerated — see §9.

- ~~**The estimate-screen transition is flaky under load.**~~ **Resolved** — it was a stale-coordinate race in the test harness, not a product defect. Diagnosed, measured and fixed; see §8. `workers: 1` stays, for the separate WebGL-contention reason.
- **Auth screen visual parity unverified** against the MODUS reference.

---

## 4. Deployment readiness checklist

| Item | State |
|---|---|
| Build succeeds with no env vars | Yes (exit 0) |
| Runtime survives missing Clerk keys | **Yes.** Public 200, protected 307/401 |
| Clerk production keys in Vercel Production | User-reported added, copied from the production instance. Not independently verified |
| `DATABASE_URL`/`DIRECT_URL` in Vercel | Reported added; migrations already applied to Supabase |
| Guest diagnostic works without an account | Yes, locally (`/diagnostic` 200 signed out) |
| Admin inbox rejects anonymous access | Yes, locally |
| Mail worker scheduled in deployment | **Yes, Hobby-compatible.** Prompt drain via `after()` on each submission + one daily sweep at 07:00 in `vercel.json`. Worker requires `CRON_SECRET`; rejects everything without it |
| Production issuer verified end to end | **No** |

---

## 5. Next actions, in order

1. Confirm Clerk **production** keys are present in Vercel Production, then push and deploy.
2. Sign in at the deployed site with **Continue with Google** as `withmodus@gmail.com`.
3. Find that user in Clerk **Production → Users**, verify the identity, take its `user_…` id.
4. Grant admin explicitly: `node scripts/grant-admin.mjs user_…` against the production database. Never from an email match or provider.
5. Test in production: admin reaches the inbox; a second ordinary account and an anonymous request are both rejected on page, API and mutation; revocation takes effect on the next request.
6. Agree a test arrangement before sending to `hello@withmodus.co`; confirm **user-reported receipt**, not just provider acceptance.
7. ~~Finish the sphere→stack graphic~~ **done, see §9**; the auth-screen visual comparison is still open.

---

## 6. Unresolved policy facts

Tracked in `MODUS_POLICY_RESOLUTION.md` and unchanged: retention periods,
international transfers, the authentication provider name in the published
policy, account deletion, and the final provider/region list. None may be
guessed; all are release blockers for the final policy text, not for code.


---

## 7. Notification worker — scope and guarantees

**`CRON_SECRET` gates the scheduled sweep only.** The submission-triggered
drain calls `dispatchPending()` as a direct function import inside
`after()` — it makes no HTTP request, so it never passes through the
authenticated endpoint. A deployment with no `CRON_SECRET` still delivers
promptly on submission; it loses only the daily retry sweep, and the
endpoint rejects every caller rather than becoming public.

Verified by test (9 cases, `src/lib/notifications/__tests__/outbox.test.ts`):

| Guarantee | Result |
|---|---|
| Mail failure keeps the record | Row stays `PENDING`, `attempts` incremented, error recorded, `sentAt` still null |
| Failure backs off | Each retry schedules strictly later than the last |
| Permanent failure stops | `FAILED` only after the attempt bound, so a bad address is not retried forever |
| Enqueue failure never breaks submission | Resolves silently — a committed record is never reported as failed |
| Repeated event collapses | Three enqueues of the same submission → **one** row |
| Delivered once | Second sweep sends nothing; `sendMail` called exactly once |
| Re-enqueue after success | Does not resurrect a sent notification |
| No provider configured | Reports the backlog, sends nothing, keeps rows `PENDING` |
| Header injection | CR/LF stripped from the subject |

### What the "skipped" count was

The `{"skipped": 74}` from the worker test is **PENDING rows in the local
development database** (`modus_dev` @ localhost), accumulated by repeated
Playwright runs submitting diagnostics. It is not production data and not
a backlog of real leads.

- Local `modus_dev` outbox: 107 PENDING at last count, all test artefacts.
- **Supabase outbox: 0 rows.**

`skipped` means "pending and not attempted, because no mail provider is
configured" — the worker reporting the backlog rather than pretending to
deliver.

## 8. The estimate-screen flake — found and fixed

**Resolved.** It was a defect in the test harness, not in the product.

### What it was

Five call sites hand-rolled the hold-to-confirm gesture: read
`boundingBox()`, then `mouse.move` to the measured centre, `mouse.down`,
wait, `mouse.up`. The review screen animates in, so those coordinates
were stale by the time the press landed.

Traced against the running app, from the instant `toBeVisible()` resolves
on the review screen:

```
t=   0ms  scrollY=122  box.y=619
t= 300ms  scrollY=123  box.y=619
t= 400ms  scrollY=123  box.y=615
t= 500ms  scrollY=123  box.y=606
t= 600ms  scrollY=123  box.y=603   <- settles
```

`scrollY` is flat across the whole trace, so this is the entrance
animation, not scrolling. The button is 53.5px tall and drifts 16px
upward. A press aimed at the t=0 centre (645) against the settled box
(603–656.5) has about 11px of slack: usually lands, occasionally not.
Under CPU contention — the suite already runs `workers: 1` because these
pages hold WebGL contexts — not.

A missed press landed on the page behind the button. Nothing threw. No
hold began, no submission was sent, and the test waited out its 15s
timeout for an estimate screen that could never arrive. Three of the five
sites also wrapped the press in `if (box)`, so a null box skipped the
gesture silently and produced that same timeout. **That silent skip is
why this always presented as "ESTIMATE not visible" and never as
anything to do with the button** — which is what kept it unexplained
across several checkpoints.

### The fix

`e2e/holdToSubmit.ts`, one shared helper, replacing all five copies. It
uses `locator.hover()`, whose actionability check waits for the element
to be visible, enabled, receiving events, and **stable** (unchanged
bounding box across two consecutive animation frames) before positioning
the pointer. The race is removed rather than the margin widened; there is
no coordinate left for the animation to invalidate.

Two earlier attempts are recorded because they were wrong and the reason
is useful: `scrollIntoViewIfNeeded` before measuring (the probe showed
the button was already inside the viewport, so this fixed nothing), and
`after()` being the cause (disabling it made things worse — 2 failures
vs 1).

### Evidence

- `--repeat-each=3` across all three submit specs: **30/30 passed.**
- Full suite: **46 passed, 1 skipped** (the skip needs
  `E2E_ADMIN_PASSWORD`). Previously 45 passed.
- `npx tsc --noEmit`: clean.
- `npx vitest run`: 50 passed.

Three clean repeats is good evidence, not proof, for a defect that was
intermittent. The mechanism is now understood and measured, which the
repeat count alone would not give.

### What this unblocks

Re-enabling the diagnostic graphic's later stages (topic layers, review
stack, mark closure) was blocked on this. They have since been re-enabled
and verified through the real journey — see §9. (At the time of writing
this section they were still **unmounted and unfinished**,
and their passing unit tests covered the state mapping only.)

`workers: 1` stays. It was set for GPU contention between concurrent
WebGL contexts, which is a separate and still-real constraint.

## 9. Diagnostic graphic — re-enabled and verified

All four stages are mounted and driven by the real screen and step. The
unit tests were never evidence that they worked: they assert the state
mapping only. What follows was verified against the running app.

### Verified through the journey

`e2e/diagnosticScene.spec.ts`, at 1440×900:

- **Every stage mounts and renders.** Entry sphere, topic layers, review
  stack, and the closure on both `result` and `profile`.
- **The active topic tracks the real step.** Asserted on the projected
  labels' own inline opacity, which is written by the render path — so it
  reports what actually rendered, not what the mapping function returns.
  Step 1 emphasises `Business`, step 2 `Customers`, and pressing Back
  resolves to the earlier layer rather than queueing.
- **Labels belong to the question stages only.** Naming topics at entry
  would imply progress that has not happened; the stack and closure are
  unlabelled.
- **Submission failure holds the review stack.** The scene never
  anticipates success: on a 500 it stays in the stack, stays unlabelled,
  and the estimate screen is asserted absent.
- **Reduced motion advances the stages without animating them.** This
  caught a real bug — see below.
- **Below each layout's threshold nothing is mounted**, so there is no
  WebGL context at all, rather than a hidden canvas.
- **The scene stays clear of the content.** Asserted geometrically
  against the fields, the question heading, the submit control, every
  per-row EDIT control, and each screen's heading. Headings are measured
  by their rendered glyphs (via `Range.getClientRects`) rather than their
  border box, because a block heading fills its column even when its text
  does not.

Screenshots: `e2e-screens/` (gitignored), 11 captures across the journey,
including the reduced-motion stages. Each is taken after the stage has
settled and with the page scroll parked, so it shows what a visitor sees
rather than a mid-morph frame.

### Three bugs this found

1. **Reduced motion froze the scene.** With no frame loop running,
   nothing picked up a stage change — a visitor who prefers reduced
   motion would have seen the entry sphere for the entire journey. It was
   invisible while the scene only mounted on `intro`, where the stage
   never changes. The composition is now re-rendered once per stage
   change: no motion, but not no information.

2. **The review column was never the width it was written to be.**
   `<Container className="max-w-2xl">` could not work — `Container`
   already sets `max-w-site`, a custom `maxWidth` extension, and Tailwind
   emits extensions after the core scale, so `max-w-site` won. The review
   column rendered at the full 1200px, which is why each row had its
   label at the far left and its `EDIT` control ~1200px away at the far
   right. The narrow wrapper is now nested inside, per the pattern
   `Container` documents.

3. **Centring that column put the submit control under the consent
   banner.** The banner is fixed bottom-centre; centring the review
   column moved the primary action beneath it. Playwright's actionability
   check caught it immediately, where the old hand-rolled press would
   have clicked the banner and reported a timeout somewhere else
   entirely. The column is left-aligned, matching the intro and question
   screens.

The scene was also pinned to `right-0` — the viewport edge, not the
content container — so on a wide screen it sat 120px right of the content
and its projected labels were clipped by the window. It now mirrors the
page `Container`.

### The sticky panel, resolved

The topic layers share the right column with `ProfilePanel`, which was
`sticky top-24`. That made the two impossible to separate with any fixed
offset, because the panel moves relative to the document: at the top of
the page it sits at its natural y (199 at 1440x900, bottom 723); once
stuck it rises to y=96 (bottom 621). Anchoring the layers to the stuck
bottom overlapped at scroll 0; anchoring to the natural bottom left 121px,
below anything worth rendering.

So the panel stops following the scroll **only while the layers are shown
beside it** (`<ProfilePanel sticky={false}>` — it still sticks at
viewports where the layers are not drawn). Both are then anchored in the
document, and the layers sit at the panel's measured bottom edge. That
measurement is taken from the column's top plus the panel's height, not
the panel's live rect, which would feed back on itself since the
measurement is what decides whether the panel is sticky at all. A
`ResizeObserver` keeps it current as the panel grows with the answers
(588px to 635px at 1024 across the six steps). Where the column cannot
give the layers at least 170px, they are not drawn.

`position: fixed` would be the obvious tool and does not work here:
`PageTransition` leaves `filter: blur(0px)` on an ancestor, and a filter
creates a containing block for fixed descendants. Verified with a probe —
a fixed element scrolled with the page instead of staying put.

**Point identities are preserved across every stage.** The scene is never
unmounted, including on the frame before the band has been measured —
returning `null` there would have taken the WebGL context and every point
position with it, and the four stages would then read as four unrelated
illustrations rather than one object being reorganised. The spec tags the
live canvas at the entry screen and re-checks that tag at the layers, the
stack and the closure, so a remount fails the test instead of passing
quietly.

### Remaining limitation

**The review-family and result stages need ≥1280px**, not 1024px: those
layouts are a narrow column or a dense grid whose only free space is the
page gutter. Between 1024 and 1280 the entry sphere, the topic layers and
the profile closure appear; the review stack and the result closure do
not. Asserted at all three widths rather than assumed.

### Evidence

- `e2e/diagnosticScene.spec.ts`: **7 tests** — the journey, the submission
  failure, reduced motion, the mount thresholds, and the whole flow
  captured and asserted at 1024 / 1280 / 1440.
- Panel/layer clearance asserted at the top of the page, half way down and
  scrolled to the bottom, on more than one step, at every width where the
  layers are drawn.
- Scene identity asserted across sphere → layers → stack → closure.
- Full e2e suite: **60 passed, 1 skipped** (61 total); `tsc --noEmit` clean;
  `vitest run` 50 passed.
- Submit specs plus the scene spec at `--repeat-each=2`: **34/34**.
- `workers: 1` unchanged, as asked.
- Screenshots: `e2e-screens/` (gitignored).

## 10. Notifications — what CRON_SECRET does and does not gate

**It gates the scheduled worker only.** Verified both ways.

- The submission route imports `dispatchPending` directly and calls it
  inside `after()` (`src/app/api/diagnostic/route.ts`). That is an
  in-process function call, not an HTTP request to the cron endpoint, so
  it never reaches the secret check. A submission still enqueues and still
  attempts prompt delivery with `CRON_SECRET` unset.
- `src/app/api/cron/notifications/route.ts` is the only reader of
  `CRON_SECRET`, and with none configured it rejects everything —
  including a request carrying Vercel's own cron header.

Live, against the running app:

| Request | Result |
|---|---|
| No credentials | **401** |
| Wrong secret | **401** |
| `x-vercel-cron: 1` alone | **401** |
| Correct secret | 200 `{"ok":true,"sent":0,"failed":0,"skipped":199}` |

`skipped` is the pending backlog in the local `modus_dev` database (test
artefacts from repeated Playwright runs), reported rather than pretended
delivered because no mail provider is configured locally.

### Duplicate prevention — verified live

Two submissions with the same `Idempotency-Key`:

- Second response returned the **same record id** with
  `deduplicated: true`.
- **One** diagnostic row and **one** outbox row for that submission.
- Inserting a second outbox row with the same `dedupeKey` is rejected by
  the database: Prisma `P2002`, `target: ["dedupeKey"]`.

The first run of that last check was **vacuous** — it failed on a missing
required column rather than the constraint, and reported "rejected"
anyway. Re-run with a complete row, it fails on the constraint itself.
Worth recording, because a dedupe check that passes for the wrong reason
is worse than none.

### Retries — unit-level only

The nine tests in `src/lib/notifications/__tests__/outbox.test.ts` cover
retention and backoff: a mail failure keeps the row `PENDING`, increments
`attempts`, records `lastError`, schedules `nextAttemptAt` in the future,
backs off further each attempt, gives up only after a bound, and a sent
row is never reconsidered or resurrected.

**Live retry behaviour is still unverified**, and cannot be verified here:
with no mail provider configured the worker skips rather than attempts, so
no real failure path runs. This is the same gap as the unconfirmed
delivery receipt at `hello@withmodus.co`.

## 11. /private is now wired to Clerk

The admin surface was guarded by a shared password in an encrypted
cookie, while `requireAdminSession`, `isAdmin` and `AdminMember` sat
implemented, unit-tested and uncalled. That is closed: every admin page,
API and mutation is now gated on Clerk identity plus a current,
server-controlled `AdminMember` row, re-read per request.

### Code complete

| Surface | Before | Now |
|---|---|---|
| `/private` and its pages | `isAuthenticated()` session cookie | `requireAdminSession()`, redirect to `/sign-in` |
| `/api/private/*` | `requireAuth()` → session cookie | `requireAuth()` → Clerk + `AdminMember` |
| `/private/login` page | Password form | Redirect to `/sign-in` |
| `/api/private/login` | Verified a password | **Deleted** |
| `/api/private/logout` | Cleared the session cookie | **Deleted** — Clerk owns sign-out |
| `src/lib/auth/session.ts` | Iron-session | **Deleted** |
| `src/lib/auth/rateLimit.ts` | Login-attempt throttling | **Deleted** |
| `LoginForm.tsx` | Password UI | **Deleted** |

Removed, not disabled: there is no second way in left to drift out of
sync. The `LoginAttempt` table is left in place — dropping it is a
migration and the rows are a record, not a credential.

The admin shell's Settings panel used to report Argon2id hashing, the
session cookie and failed-login counts. Those described a door no longer
on the building, so that panel now reports the authentication provider,
that authorization is an `AdminMember` row re-read per request, that
revocation applies on the next request, and — stated plainly rather than
omitted — that multi-factor is **not enforced**.

### Verified

`src/lib/auth/__tests__/privateRoutes.test.ts` drives the **real route
handlers**, not the helpers in isolation:

- Anonymous → **401**.
- Ordinary signed-in account → **403**, with a body identical to the 401
  so the surface cannot be probed to discover who holds admin.
- Active admin → **200**.
- Revoked admin → **403 on the very next request**, with no sign-out and
  no cache to wait out.
- Provider unconfigured → **401**: fails closed.
- Private notes (`POST .../notes`) and the record detail and delete
  routes → 403 for an ordinary account, 401 for anonymous.

`e2e/private.spec.ts` covers what a browser can assert without a secret,
and now runs on every pass instead of being skipped: four admin pages
each **307** to `/sign-in`, three private APIs each **401** with no
submission fields in the body, `/private/login` redirects to Clerk, and
`/api/private/login` returns **404** — the handler is gone.

The old `E2E_ADMIN_PASSWORD` test is deleted with the mechanism it tested.
Driving a real Google sign-in from Playwright needs Clerk's test tooling
and live credentials, so the signed-in cases are covered server-side as
above. **The suite now has no skipped tests.**

### Still requires deployment to verify

- Production Clerk token acceptance through PostgREST. The genuine
  evidence to date used the **development** issuer.
- The production Clerk user id for `withmodus@gmail.com`, which does not
  exist until the first production Google sign-in. It must be read from
  the production instance and granted explicitly via
  `scripts/grant-admin.mjs`. **The development user id must not be
  reused.** Access is never granted by email match, by Google sign-in, by
  being first to sign up, or by anything the client supplies.
- MFA remains **intentionally deferred** by your decision. All other
  membership and authorization protections are retained.

## 12. Admin opens in a second tab

After sign-in, the MODUS tab stays where it is and the admin inbox opens
beside it — for administrators only, decided by the server.

`GET /api/admin/status` answers only about the caller's own verified
session. It takes no user id, so it cannot be asked about anyone else,
and "not signed in" and "signed in without membership" return the same
`{ admin: false }`.

`AdminInboxLauncher` (mounted in the marketing layout) probes once, and
on `{ admin: true }` opens `/private` with `window.open`. Specifically:

- **Popup blocking is expected**, not an edge case: a `window.open` that
  is not tied to a user gesture is routinely blocked, which is exactly
  the case straight after an OAuth redirect. When blocked, a dismissible
  **"Open admin inbox"** link is shown instead — a real anchor, so the
  click is a gesture and always opens.
- **No repeat tabs.** The outcome is recorded per account in
  `sessionStorage`, so a refresh or a later navigation does not open a
  second tab. If storage throws, the attempt is treated as already
  handled rather than retried.
- **Never from inside `/private`**, which would spawn a tab per load.
- **Ordinary users and signed-out visitors** get nothing; one cached
  probe, then silence.
- **The tab grants nothing.** `/private` re-checks identity and
  membership on every request, so a tab opened by any means still lands
  on sign-in unless the membership is real and current.

## 13. The live /private error — diagnosed

**Not caused by the unpushed work.** The deployed commit is `611be43`;
HEAD is 17 commits ahead and nothing has been pushed.

The actual exception, reproduced by checking out `611be43` into a
worktree and running it with no `SESSION_SECRET`:

```
⨯ Error: SESSION_SECRET is missing or too short. Set a 32+ byte secret in .env
    at secret (src/lib/auth/session.ts:34:11)
    at sessionOptions (src/lib/auth/session.ts:43:15)
    at getSession (src/lib/auth/session.ts:56:51)
    at async isAuthenticated (src/lib/auth/session.ts:60:19)
    at async PrivateAppLayout (src/app/private/(app)/layout.tsx:12:9)
```

Live behaviour matches that signature exactly:

| Route | Live status |
|---|---|
| `/` | 200 |
| `/diagnostic` | 200 |
| `/private` | **500** |
| `/private/login` | **500** |
| `/api/private/overview` | **500** |

`/api/private/overview` is the tell: it is built to answer **401** to an
anonymous caller and instead throws, because `requireAuth()` →
`isAuthenticated()` → `getSession()` raises before any authorization
decision is reached. The public site is unaffected, which rules out a
build or database-wide fault.

**Honest limit:** the local digest is `385869121`, not the live
`2989066277`. Digests are build-specific, so this confirms the code path
and failure mode, not that specific production instance. Definitive
confirmation needs the Vercel runtime log for that request — I am not
authenticated to the Vercel CLI and this session cannot run the OAuth
flow, so **please confirm from Vercel → Logs**, or simply check whether
`SESSION_SECRET` is set in Production.

**Either way this is already fixed at HEAD, twice over:** the guard
`sessionSecretAvailable()` was added after the deployed commit, and the
Clerk migration deletes `session.ts` entirely — `/private` no longer
reads `SESSION_SECRET` at all. No fake-login bypass was introduced.

## 14. Auth screens — styled and verified

`/sign-in` and `/sign-up` were bare `<SignIn />` on a white flex
container: Clerk's card, Clerk's typeface, Clerk's blue button. They now
sit on the MODUS surface — warm ground `#D7D7D0`, the bare ink mark
linking home, the serif display face, a cream card and a rounded MODUS
green action.

Asserted against the rendered page at **1440×900 and 390×844**, for both
routes:

- `body` background is exactly `rgb(215, 215, 208)`.
- The bare mark renders and links home.
- The `h1` resolves to the serif stack, so the font actually loaded.
- The primary action computes to `rgb(30, 59, 46)` with white label text.
- Keyboard focus produces a visible indicator, not a suppressed default.
- The guest diagnostic stays reachable from the auth screen.

Screenshots: `e2e-screens/auth-{sign-in,sign-up}-{desktop,mobile}.png`.

### Two bugs the screenshots caught that the assertions did not

1. **The primary button was invisible** — white label on a transparent
   background. Clerk's `appearance.variables.colorPrimary` injects its own
   `--accent` custom property onto its subtree, shadowing the MODUS token
   of the same name, so `rgb(var(--accent))` resolved to `rgb(#1E3B2E)`,
   which is invalid and was dropped. The border and text colour in the
   same rule applied normally, which made it look like a cascade problem.
   Fixed with `--modus-*` aliases computed on `:root`. A separate earlier
   attempt failed for a different reason worth recording: Tailwind classes
   passed through `appearance.elements` live in a `.ts` file, and only
   those utilities already used elsewhere in the project were ever
   emitted.
2. **The consent banner covered the footer links**, so "run a diagnostic
   as a guest" could not be clicked until consent was answered. The screen
   now reserves space for the banner.

### Not fixable from code

**GitHub is still offered as a sign-in provider** on both screens while
being unconfigured — it is a Clerk dashboard setting. It should be
disabled in Clerk Production, or it will present a broken path to anyone
who clicks it.

## 15. Notifications and provider configuration

### Code complete

The three environment variable names in the code match what you reported
saving: `FORM_NOTIFICATION_TO` (recipient, defaulting to
`hello@withmodus.co`), `RESEND_API_KEY` and `MAIL_FROM`. Mail is treated
as configured only when **both** `RESEND_API_KEY` and `MAIL_FROM` are
present.

### Verified live, against the running app

- `CRON_SECRET` gates the scheduled worker **only**. The submission path
  imports `dispatchPending` directly and calls it inside `after()` — an
  in-process call that never reaches the secret check.
- Unauthorized worker requests rejected: no credentials **401**, wrong
  secret **401**, bare `x-vercel-cron` header **401**. Correct secret 200.
- Duplicate prevention: same `Idempotency-Key` returned the same record id
  with `deduplicated: true`; one diagnostic row, one outbox row; a second
  outbox row with the same `dedupeKey` rejected with Prisma `P2002` on
  `["dedupeKey"]`.

### Not verified, and cannot be here

- **Live retry and backoff.** With no mail provider configured locally the
  worker skips rather than attempts, so no real failure path runs. Covered
  at unit level only (retention, backoff growth, give-up bound, no
  resurrection, no double send).
- **Actual inbox receipt at `hello@withmodus.co`.**
- **Scheduled execution on Vercel.**
- **Whether `CRON_SECRET` is saved in Vercel Production.** I cannot read
  Vercel's environment from here. Please confirm it is **present** — do
  not send the value.

Per your instruction, no production submission or test email has been
created. Both need an explicit test arrangement from you.

## 16. Database safety — re-verified

- Local commands target `localhost:5432/modus_dev`; the production
  connection strings remain isolated in `.env.supabase.local`, loaded
  explicitly by the Supabase scripts. Verified by inspecting each file's
  host without printing credentials.
- Against production, read-only: **4 migrations found, schema up to
  date.**
- `public._prisma_migrations`: RLS **enabled**, **0 policies** (RLS on
  with no policy is deny-all), and **no grants** to `anon`,
  `authenticated` or `public`. Denial proven by actually attempting a read
  under each browser role — both were refused. `prisma migrate status`
  still works, because it connects as the table owner and
  `FORCE ROW LEVEL SECURITY` is deliberately not set.
- The four original diagnostics and the separately recorded orphaned rows
  are untouched.

## 17. Deployment, 3 October 2026 — results

Pushed `611be43..0504f33` and deployed. Authorized by the user, including
one clearly-labelled synthetic production diagnostic.

### The first deployment failed, and not for the reason I guessed

`c0374c7` failed in **three seconds**, before compiling:

```
Error: Invalid vercel.json - `crons[0]` should NOT have additional property `comment`. Please remove it.
```

I had attributed the delay to the GitHub repository rename
(`jorisvrr/modus` → `jorisvrr/MODUS`) preventing the integration from
firing. That was wrong: the deployment was triggered normally and failed
on schema validation. `vercel.json` accepts only `path` and `schedule` in
a cron entry; the explanatory comment moved to
`MODUS_PROVIDER_SETUP.md` §3c, together with the reason it cannot live in
that file.

Because the failed build never reached compilation, it proved nothing
about the new code. A full `next build` was therefore run locally before
pushing the fix, and succeeded — including `/sign-in`, `/sign-up`,
`/api/admin/status` and the rewired `/private` routes.

`0504f33` deployed successfully.

### Verified live (`scripts/verify-production.mjs`)

**Public and guest routes** — `/`, `/diagnostic`, `/pricing`,
`/how-it-works`, `/legal`, `/privacypolicy`, `/sitemap.xml`,
`/robots.txt` all **200**.

**Admin surface closed** — `/private`, `/private/diagnostics`,
`/private/settings` each **307** to
`/sign-in?redirect_url=%2Fprivate`. `/api/private/diagnostics`,
`/api/private/overview`, `/api/private/diagnostics/export` each **401**
with no submission fields in the body. `/api/admin/status` returns
`{"admin": false}` to an anonymous caller. The §13 `SESSION_SECRET` 500
is gone.

**The password endpoint has no handler.** Worth recording precisely,
because the first check reported this as a failure and it was the check
that was wrong: a POST to `/api/private/login` returns **200** in
production, since Next renders the not-found *page* for a POST to a path
with no handler. `x-matched-path` is `/_not-found`, the body is the 404
page, and **no session cookie is issued**. A GET returns 404. Both the
script and `e2e/private.spec.ts` now assert "no handler ran and no
session was issued" rather than a status code, which is the property that
actually matters and which does not differ between dev and production.

**Notification worker** — no credentials **401**, wrong secret **401**,
bare `x-vercel-cron` header **401**.

**Guest submission, persistence and safe retry** — one synthetic record
created; a retry with the same `Idempotency-Key` returned the **same
record id** with `deduplicated: true`; the table went from 4 rows to
exactly 5; **all four original diagnostics preserved**.

**Notification delivery** — exactly one outbox row for the submission,
`status=SENT`, `attempts=1`, `recipient=hello@withmodus.co`, `sentAt`
14:31:47 CEST, no error. The provider accepted it; **receipt in the
inbox is the user's to confirm.**

### The synthetic record

| | |
|---|---|
| id | `cmusdftjk0000js04pm4tad9o` |
| company | `SYNTHETIC TEST RECORD — MODUS deployment check` |
| email | `synthetic-test+2026-10-03T12-31-44-652Z@withmodus.co` |

No real customer information. It is the fifth row; the four originals are
untouched. Remove it whenever you like — it is identifiable by the
company name or the `synthetic-test+` email prefix.

### Still blocked on the first Google sign-in

The production Clerk instance currently holds **0 users**, confirmed
through the Clerk Backend API with the production key. Until
`withmodus@gmail.com` signs in at `https://www.withmodus.co/sign-in`:

- its production Clerk user id does not exist, so admin membership cannot
  be granted;
- production Clerk-token → PostgREST access cannot be verified, because
  minting a session token requires a real user. **The existing genuine
  evidence used the development issuer and does not carry over.**

Once that sign-in has happened: read the id from the production instance
(never reuse the development id, never grant by email match), grant with
`scripts/grant-admin.mjs`, then test allow / deny / revoke-and-deny, and
restore the intended membership.

**MFA remains intentionally deferred** by the user's decision. All other
membership and authorization protections are in force: membership is a
server-controlled row, re-read on every protected request, and revocation
takes effect on the very next request.

## 18. Production admin bootstrap — 3 October 2026

### Identity verified against the production Clerk instance

| | |
|---|---|
| user id | `user_3KBVdozubSltDS4W58CkOj9BLcB` |
| email | `withmodus@gmail.com`, verified |
| provider | `oauth_google` |
| `two_factor_enabled` | **false** |
| created | 2026-10-03T12:37:17Z |

Read from the production instance with the `sk_live` key, which was
checked for that prefix first. The instance holds exactly one user. The
**development** user id was not reused, and membership was granted to
this id explicitly — never by email match, provider, or being the first
account.

### Admin allow / deny / revoke — verified on the live site

Driven with a real production session token against
`https://www.withmodus.co`, not inferred
(`scripts/verify-admin-production.mjs`):

| Case | `/api/admin/status` | `/api/private/overview` |
|---|---|---|
| Anonymous | `admin:false` | **401** |
| Signed in, membership active | `admin:true` | **200** |
| Signed in, membership revoked | `admin:false` | **403** |
| Membership restored | `admin:true` | **200** |

The revoked case is also the "ordinary signed-in account" case: the same
real production session, with no membership row, is refused. **Revocation
took effect on the very next request** — no sign-out, no new session, no
cache to wait out.

Final state: exactly **one active membership row** for that user. The
intended membership is restored.

A second production Clerk account was **not** created to test an ordinary
user separately — that was not authorized, and the revoked case covers
the same path with a real session.

### Why a new script was needed

`scripts/grant-admin.mjs` uses the default `DATABASE_URL`, which locally
is `modus_dev`. Running it unmodified would have granted admin on the
development database. `scripts/with-production-db.mjs` loads
`.env.supabase.local` in Node, refuses any host that is not the Supabase
project, prints the host and never the credentials. A first attempt that
extracted the URL with shell tools produced a mangled connection string
and a Prisma validation error — **nothing was written anywhere**, which
the production row count confirms.

### MFA — still deferred, and now measurable

`two_factor_enabled` is **false** on the production admin account, and
`ADMIN_MFA_REQUIRED` is unset, so the application does not enforce a
second factor. This remains the user's explicit decision. Any two-step
verification on the underlying Google account protects the Google login
only and is **not** application-enforced MFA.

## 19. Clerk → Supabase on production — RESOLVED, then verified properly

### The `role` claim was missing; it is now present

Found while verifying production PostgREST access. **The previous
evidence used the development issuer and did not carry over.**

What is correct:

- `https://clerk.withmodus.co/.well-known/jwks.json` publishes a key.
- A real production session token mints and verifies: `sub` is the
  production user id, `iss` is `https://clerk.withmodus.co`.
- Anonymous PostgREST access is refused on `Diagnostic`, `AdminMember`
  and `Profile` (Postgres `42501`).
- `AdminMember` is not readable by the browser role.
- The grants are right: `authenticated` holds SELECT on `Diagnostic`.

What is wrong:

- An **authenticated** request is refused with
  `permission denied for table Diagnostic`.
- The production session token's claims are
  `exp, fva, iat, iss, nbf, sid, sts, sub, v` — there is **no `role`
  claim**.

Supabase's native third-party auth assumes the Postgres role named in the
token's `role` claim. Without it the request is treated as `anon`, which
holds no grants — hence the refusal, despite `authenticated` being
correctly granted.

**This is a Clerk dashboard setting on the production instance, not a code
defect.** Enable the Supabase integration for the production instance, or
add `"role": "authenticated"` to its session-token claims. The
development instance evidently has this and production does not, which is
exactly why the earlier evidence did not transfer.

**Current impact: none at runtime.** `src/lib/supabase/client.ts` is not
imported by any application code — the app reads and writes through
Prisma server-side. This is a latent gap that must be closed before any
browser-side Supabase access is relied on, not a live fault.

### Resolved — fresh token, 3 October 2026

The Clerk production instance now issues the claim. A fresh token minted
through the sign-in-token flow carries:

```
claims: exp, fva, iat, iss, nbf, role, sid, sts, sub, v
iss   = https://clerk.withmodus.co
sub   = user_3KBVdozubSltDS4W58CkOj9BLcB
role  = authenticated
```

The token itself was never printed. `role` is present where it was
absent, so Supabase now assumes the `authenticated` Postgres role instead
of falling back to `anon`.

### The first ownership check failed, and the assertion was wrong

Assigning the synthetic record to the production user and reading as that
user returned **all five rows**, which looked like the four guest records
being exposed. The policies are correct and so was the result:

```
diagnostic_select_own    USING ("ownerId" = current_clerk_id())
diagnostic_select_admin  USING (is_modus_admin())
```

Postgres combines permissive policies with **OR**, and the account under
test had just been granted admin membership (§18), so `is_modus_admin()`
was true and it saw everything *by design*. Ownership isolation cannot be
measured with an account that bypasses it.

This is worth recording because the failure looked exactly like a data
leak. It was a test that measured the wrong thing.

### Ownership isolation, measured with admin OFF

`scripts/verify-ownership-isolation.mjs` revokes admin membership for the
duration, runs the check, and restores both the membership and the
record's ownership in a `finally` block so a failed assertion cannot
leave either changed.

| Check | Result |
|---|---|
| `iss` | `https://clerk.withmodus.co` |
| `role` | `authenticated` |
| Anonymous — `Diagnostic`, `AdminMember`, `Profile` | rejected, `42501` |
| Authenticated read returned | **1 row — non-empty** |
| The owned record returned to its owner | yes |
| Guest records visible | **none of the 4** |
| Rows visible in total | exactly 1, the owned one |
| `AdminMember` readable | no |

**A zero-row result is treated as a failure by this script, not a pass.**
An empty read is what a broken token also produces, so the owner case has
to return the specific record — and it did.

### Restored, and confirmed afterwards

| | |
|---|---|
| Synthetic record ownership | back to `null` (guest) |
| Admin membership | 1 active row |
| Original diagnostics | all 4 present and still unowned |
| `/api/admin/status` (live, as the admin) | `200`, `admin: true` |
| `/api/private/overview` (live, as the admin) | `200` |
| Diagnostics in production | 5 total, 5 unowned |

So both behaviours are now evidenced on production: an administrator sees
every record through `diagnostic_select_admin`, and an ordinary
authenticated account sees only what it owns through
`diagnostic_select_own` — while anonymous callers are refused outright.

## 20. Account isolation — fixed (task 1 of the correction brief)

### What "Sign in diagnostic" was displaying

The saved Diagnostic reference — a capability token plus the company name
— lived in `localStorage` under `modus:customer-context:v1` with **no
record of whose it was**. `useCustomerContext` read it unconditionally,
and `DiagnosticShell` opened the profile screen whenever it existed.

So the reference was scoped to the *browser*, not the *account*. After a
sign-out or an account switch the next person at that device saw the
previous account's company name in the navigation and on the homepage,
was offered "Continue Diagnostic"/"View Your Profile", and landed on the
previous account's profile screen at `/diagnostic`. Their capability
token also stayed in storage, readable by anyone with the device and
usable against the public context endpoint.

Guest diagnostics remain accessible, as specified: the context endpoint
is deliberately a capability-token design for submitters who have no
account, and that is unchanged.

### What changed

- **Identity is now a first-class value.** `IdentityProvider` supplies the
  Clerk user id, or `"guest"`, or `null` while Clerk is still loading.
  `null` is distinct on purpose: treating "not yet known" as "guest" is
  what would flash one account's data before the account was known.
- **Every read and write of the reference is scoped.**
  `getContextReference(identity)` returns it only to the identity that
  saved it. A reference written before scoping existed has no identity and
  is returned to nobody.
- **Foreign state is removed, not merely hidden.**
  `purgeForeignContextReference` deletes a reference belonging to another
  identity, so the token does not sit in storage after someone signs out.
  Admin-tab bookkeeping for other accounts is cleared too.
- **Cached server output is invalidated.** `AccountStateBoundary` calls
  `router.refresh()` on an identity change, so RSC payloads rendered for
  the previous account are not reused on a Back navigation. The context
  fetch is `cache: "no-store"`.
- **Late responses are discarded.** A context fetch started under one
  account cannot write into another's state; any summary already held is
  dropped the instant the identity changes.
- **Guest drafts are preserved separately**, as specified. The in-progress
  answers live in `sessionStorage` under their own key, are the work of
  whoever is at the browser, and are not account data.

### The admin tab

`AdminInboxLauncher` now opens only after `/api/admin/status` confirms
membership **for the current account**:

- the account is captured when the probe starts and compared with the
  current one when it resolves, so an answer that arrives after a switch
  is discarded;
- any conclusion reached for a previous account is cleared the moment the
  identity changes;
- it never runs for `"guest"`, and never opens merely because somebody
  signed in — only a server `admin: true` opens it.

### Verified

**Unit — 12 tests** (`src/lib/customerContext/__tests__/storage.test.ts`):
returned to its owner; **not** to a different account; **not** after
sign-out; a guest submission is not handed to an account that signs in
later; nothing returned while the identity is unknown; a pre-scoping
reference is discarded; another account's token is **removed** from
storage; the current account's own reference is kept; an unparseable
reference is removed; nothing is purged while the identity is unknown.

**Browser — 6 tests** (`e2e/accountIsolation.spec.ts`), asserting on the
actual data and storage rather than on hidden UI:

| Case | Result |
|---|---|
| Another account's company name anywhere in the page | absent |
| Navigation offer | generic "Run a Diagnostic" |
| Their token after load | **removed from `localStorage`** |
| `/diagnostic` with a foreign reference | entry screen, no "PROFILE READY" |
| Reload, and browser Back from another page | still absent, still removed |
| A **guest's own** reference | honoured and kept |
| Admin tab for an anonymous visitor | no second tab, no link |
| `/api/admin/status` unauthenticated | `{"admin": false}` |

The guest-reference case is there deliberately: a change that simply
deleted everything would pass every isolation check while removing the
feature.

### A regression this introduced, and the fix

Scoping the read broke the profile screen. The initial screen is chosen
on the first render, when Clerk has not yet reported who the visitor is,
so `getContextReference(null)` returned nothing and `/diagnostic` always
opened on the entry screen. Five scene tests caught it.

The screen is now settled once the identity arrives — only from the entry
screen, and only once, so a visitor who has already started answering is
never pulled out of the form by a late identity resolution.

### Remaining limitations

- The browser tests run with Clerk **signed out**, so the live identity is
  `"guest"`. Both directions of the rule are proven, but a real
  signed-in-to-signed-in **account switch** in a browser is not yet
  covered by an automated test — that needs Clerk's test tooling and two
  real accounts. The rule it would exercise is covered at unit level.
- Tasks 2–5 of this brief (auth transition, diagnostic graphic, hero
  bubbles, `/private` redesign) are **not started**.
