# Provider setup checklist

Everything below is **configuration you do in a provider dashboard**. All
the code, migrations and tests are already in the repository.

**Do not paste any secret into chat.** Enter values directly in the
provider dashboards and in Vercel. Nothing here needs to be shared.

---

## 1. Supabase — database

Create a project (EU region, e.g. `eu-central-1`, so data stays in the EEA
and the privacy policy's transfer section stays simple).

From **Project Settings → Database → Connection string**:

| Variable | Which string | Notes |
|---|---|---|
| `DATABASE_URL` | **Transaction pooler**, port **6543** | Runtime queries. Append `?pgbouncer=true&connection_limit=1` for serverless. |
| `DIRECT_URL` | **Direct connection**, port **5432** | Migrations only. `prisma migrate` cannot run through a pooler. |

Then apply the schema (from your machine, once):

```
npx prisma migrate deploy
```

That creates every table and installs the RLS policies, including the
`anon`/`authenticated` grants and the `is_modus_admin()` helper.

**Migrating the existing 4 submissions** (already exported to
`prisma/export/sqlite-export.json`):

```
node scripts/migration/import-postgres.mjs
```

It is idempotent and refuses to run if the target already holds more
diagnostics than the export.

---

## 2. Clerk — identity

Create an application. Enable only the sign-in methods you actually want
offered; the UI shows configured providers only.

| Variable | Where to find it | Scope |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | API Keys | Public (safe in the bundle) |
| `CLERK_SECRET_KEY` | API Keys | **Server only** |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Webhooks → endpoint | **Server only** |

In Clerk: **User & Authentication → Multi-factor** → enable TOTP, and
require MFA for the accounts you grant MODUS admin to.

### Connect Clerk to Supabase (native integration)

Use the **native third-party auth integration**, not the deprecated JWT
template:

1. Clerk → **Integrations → Supabase** → enable, copy the Clerk domain.
2. Supabase → **Authentication → Third-party Auth** → add Clerk, paste it.

The RLS policies already read `request.jwt.claims ->> 'sub'` as a **text**
Clerk id (`user_2abc…`). They never join `auth.users`, because Clerk users
do not have rows there.

---

## 3. Transactional email

`hello@withmodus.co` is a **receiving** alias on Namecheap forwarding. A
forwarding alias cannot send. Outbound needs a verified sender.

Create a Resend account, verify the `withmodus.co` domain (add its DKIM and
SPF records at Namecheap — these are additive and will not disturb the
existing Google Search Console TXT record or your forwarding MX records).

| Variable | Value | Scope |
|---|---|---|
| `RESEND_API_KEY` | From Resend → API Keys | **Server only** |
| `MAIL_FROM` | e.g. `MODUS <notifications@withmodus.co>` — must be on the verified domain | Server |
| `FORM_NOTIFICATION_TO` | `hello@withmodus.co` | Server. Optional; this is the default. |

Until `RESEND_API_KEY` and `MAIL_FROM` are both set, the outbox logs how
many notifications are waiting and sends nothing. It never pretends to
deliver.

---

## 3b. Supabase client keys (browser)

The app uses `@supabase/supabase-js` (2.117.2) so that user-scoped reads go
through PostgREST and therefore exercise RLS.

| Variable | Supabase dashboard | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → Data API → **Project URL** | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → **Publishable key** (`sb_publishable_…`) | Public |

Older projects label the same thing "anon public" (a `eyJ…` JWT). The code
accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` as an alias, so either name works —
set whichever matches your dashboard.

Both are public by design: they ship to the browser and RLS is what
protects the data. The **secret / service-role** key is a different key and
must never be put in a `NEXT_PUBLIC_` variable. This project does not use
it at all.

## 4. Site

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_ORIGIN` | `https://www.withmodus.co` |

Already defaults to this; set it explicitly on preview deployments so they
do not advertise production URLs.

---

## 5. Where to put them

**Vercel → Project → Settings → Environment Variables.**

- Production **and** Preview for everything except the pooled
  `DATABASE_URL`, which should point at a separate database for Preview if
  you ever want previews writing data.
- `NEXT_PUBLIC_*` are exposed to the browser by design. Everything else
  must stay server-only — never prefix a secret with `NEXT_PUBLIC_`.
- There is **no** `SUPABASE_SERVICE_ROLE_KEY` in this setup. The server
  talks to Postgres through Prisma over `DATABASE_URL` and performs its
  own authorization before every privileged operation, so the
  RLS-bypassing service-role key is not needed and is deliberately absent.

Locally, the same names go in `.env` (gitignored, never committed).

---

## 6. Granting the first administrator

Signup grants nothing. Admin is a row in `AdminMember`, written only by an
explicit human-run command:

```
node scripts/grant-admin.mjs user_2abc...   # the Clerk user id
```

Find the id in Clerk → Users. The script refuses to run without a real
Clerk id and records who granted it. There is no "first signup becomes
admin", no email-domain rule, and no password in any file.

To revoke: `node scripts/grant-admin.mjs --revoke user_2abc...`. The next
protected action fails immediately, because membership is re-read from the
database on every request rather than trusted from a token claim.

---

## 7. After configuring — what still needs verifying

These could not be verified without the credentials above, and are **not**
claimed as working:

- [ ] A real diagnostic submission appears in Supabase.
- [ ] Clerk sign-in, sign-up, verification, recovery and sign-out.
- [ ] MFA is enforced on a direct admin request, not just hidden in the UI.
- [ ] A notification actually arrives at `hello@withmodus.co`.
- [ ] Two ordinary accounts cannot read each other's records through the
      live PostgREST endpoint (the policies are verified locally — see
      `MODUS_VALIDATION_REPORT.md` — but not yet against Supabase).
