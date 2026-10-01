# MODUS Security Audit

Internal tracking log for security-relevant findings. No real secrets in this file, ever.

## Baseline status (2026-08-30)

**Strix (authorized pentest agent) has NOT been run.** It requires installing new
software via a remote `curl | bash` script, a paid LLM API key (OpenAI/Anthropic/etc.)
to drive its own agent loop, and Docker — none of which are present in this
environment, and none of which should be set up without your explicit go-ahead
(cost + new third-party code execution). See the session's tooling report for
exact commands if you want to run it yourself.

What follows instead is what was actually verified this session, live, via
Playwright driving a real browser against the local dev server — not a scanner
report, but not nothing either.

## SEC / 001 — /private authentication boundary

**SEVERITY:** informational (verified working, not a finding)
**STATUS:** VERIFIED

Checked directly, each with a real browser session:

- Unauthenticated visit to `/private` redirects to `/private/login` (server-side
  redirect in `src/app/private/(app)/layout.tsx`, not a client-side guard that
  could be bypassed by disabling JS).
- Wrong credentials: rejected with a generic "Invalid credentials" message —
  does not reveal whether the username or password was the wrong part.
- `/api/private/diagnostics` returns `401` for an unauthenticated request
  (confirmed via a direct API call, not just UI navigation).
- Valid credentials sign in; logging out actually invalidates the session —
  confirmed by signing out and then re-requesting `/private`, which redirects
  to login again rather than serving cached/stale access.
- Login is rate-limited server-side: 5 failed attempts per IP per 15 minutes
  (`src/lib/auth/rateLimit.ts`), backed by a real `LoginAttempt` table, not an
  in-memory counter that resets on deploy.

**VERIFIED:** `e2e/private.spec.ts` (Playwright), run against a temporarily-swapped
known admin password, restored immediately after.

## SEC / 002 — Dependency: deepmerge-ts stack exhaustion (via prisma CLI)

**SEVERITY:** LOW (practical risk, for this project)
**STATUS:** OPEN, NOT FIXED — no safe fix exists yet

`npm audit` flags `deepmerge-ts < 8.0.0` (GHSA-ggr8-5vv4-36mx, stack exhaustion
on recursive object merging), pulled in transitively via `@prisma/config` ←
`prisma` (the CLI devDependency, not `@prisma/client`, which is what actually
runs in production).

- `npm audit fix --force` wants to **downgrade** `prisma` to `6.12.0` — not a
  real fix, not something to run blindly.
- The only version line that bumps `deepmerge-ts` to a fixed release requires
  Prisma 8, which as of this audit only has release-candidate builds
  (`8.0.0-rc.9-dev.*`) — no stable release exists yet.
- Impact is limited to local developer use of the `prisma` CLI itself (schema
  parsing/migrations), not anything internet-facing or running in the deployed
  app.

**DECISION:** leave as-is until Prisma 8 stable ships, then reassess. Not
worth downgrading or jumping onto a release candidate for a dev-only CLI risk.

## SEC / 003 — Loader ignores `prefers-reduced-motion` (accessibility, not exploit)

**SEVERITY:** LOW (accessibility correctness bug, not a security vulnerability)
**STATUS:** FIXED

Found while building the Playwright responsive-screenshot suite (not by Strix
or any security tool) — flagging here anyway since it's exactly the kind of
"looks fine until you actually test it" bug this whole tooling pass exists to
catch. `src/components/Loader.tsx` claimed to skip entirely under reduced
motion but didn't: reading `matchMedia` in a `useState` lazy initializer
produced a real hydration mismatch (server always renders `false` since
`matchMedia` doesn't exist during SSR; the client's first render computed
`true` immediately), and React never reconciled the stale server-rendered
loader markup away. Fixed by switching to `useSyncExternalStore`, which is
the React-sanctioned way to read `matchMedia` specifically because it handles
the server-snapshot-differs-from-client-snapshot case correctly.

**VERIFIED:** `e2e/loader.spec.ts` — asserts the loader is fully absent under
emulated reduced motion, and still shows/clears itself normally otherwise.

## Not yet covered

- No Strix run (see baseline note above).
- No cross-account/RLS testing — not applicable, MODUS has no Supabase/RLS
  layer (see the tooling report for why that wasn't introduced).
- No fuzzing of the `/api/diagnostic` Zod schemas beyond what the existing
  vitest suite covers for the pricing engine.
- No CSRF-specific testing of the admin mutation endpoints.
- No dependency scan beyond `npm audit`'s default advisory database.
