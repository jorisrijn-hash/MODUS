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
- **Diagnostic graphic — UNFINISHED. Only the entry sphere is active.**

  | Stage | State |
  |---|---|
  | Entry sphere | **Active** on `/diagnostic`, desktop ≥1024px |
  | Topic layers (question stages) | **Disabled** — code written, not mounted |
  | Review stack | **Disabled** — code written, not mounted |
  | Mark closure (success) | **Disabled** — code written, not mounted |

  The three disabled stages have passing unit tests, and that is **not**
  evidence they work. The tests cover the state mapping only — which stage
  a screen maps to, and that success cannot be reached before persistence.
  Nothing has rendered them, nobody has looked at them, and their
  composition against the form and the profile panel is unresolved.
  Treat them as unfinished.

  They are unmounted because running the scene through the question and
  submit screens measurably destabilised submission: three specs began
  failing intermittently at the estimate screen, and restricting the mount
  to `intro` restored 45 passing. Bisected — it is **not** the `after()`
  dispatch; disabling that made it worse.

  Projected labels use the real step names and work, but are only visible
  on the stages that are currently disabled.
- **The estimate-screen transition is flaky under load.** The long-standing pre-existing failure hits the same point, and it is the blocker on re-enabling the graphic's later stages. Playwright runs serially because of it. Under active investigation; see §7.
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
7. Finish the sphere→stack graphic and the auth-screen visual comparison.

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
