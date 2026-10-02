# MODUS — project status

Updated after each task. Separates **code complete**, **dashboard
configured** and **connected and verified** — they are not the same thing.

Last updated: 2 October 2026.

---

## Deployment readiness: READY TO PUSH

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
- **GitHub sign-in is unconfirmed** — cloned as enabled but showing "Setup required". Should be disabled until real credentials exist, rather than left half-configured.
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
  with the scene mounted throughout — 42/42 over three repeats.

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

### Two limitations, stated plainly

- **The topic layers share a column with the `sticky` ProfilePanel.** At
  the top of the form screen the layers sit cleanly below the panel; once
  scrolled to the bottom the panel follows down and covers their upper
  portion, so roughly four of the six layers are visible at any given
  scroll position. Any height that avoids this at one scroll position
  makes it worse at the other. Moving the scene into that column in
  normal flow would fix it, but would remount the canvas between screens
  and so destroy the persistent point identities that make the four
  states read as one object being reorganised. Left as is, deliberately.
- **The review-family and result stages need ≥1280px**, not 1024px,
  because those layouts are a narrow column or a dense grid whose only
  free space is the page gutter. Between 1024 and 1280 the entry sphere
  and topic layers appear but the stack and the result closure do not.

### Evidence

- `e2e/diagnosticScene.spec.ts`: 4 tests, all passing.
- Full e2e suite: **50 passed, 1 skipped** (the skip needs
  `E2E_ADMIN_PASSWORD`), up from 46.
- Submit specs plus the scene spec at `--repeat-each=3`: **42/42**, with
  the scene mounted through the whole journey including submit.
- `npx tsc --noEmit` clean; `npx vitest run` 50 passed.
- `workers: 1` unchanged, as asked — it is set for GPU contention between
  concurrent WebGL contexts, which this change makes more relevant, not
  less.
