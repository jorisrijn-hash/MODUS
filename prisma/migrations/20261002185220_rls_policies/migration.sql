-- Row Level Security for the Supabase + Clerk native third-party auth
-- integration.
--
-- Clerk session tokens are passed to Supabase with the supported
-- access-token mechanism, so `auth.jwt() ->> 'sub'` is the Clerk user id.
-- It is a STRING like "user_2abc...", not a uuid, and Clerk users do NOT
-- have rows in auth.users — every policy below compares text to text and
-- never joins auth.users.
--
-- The deprecated Clerk JWT-template approach is deliberately not used.
--
-- IMPORTANT: RLS constrains ROWS, not COLUMNS. Where a column must not be
-- writable by its owner (ownership, review status, pricing), that is
-- enforced by withholding the column grant, not by a policy.

-- Supabase provides the `anon` and `authenticated` roles. They are created
-- here only when absent, so this migration can also be applied to a plain
-- Postgres for verification. On Supabase both branches are skipped.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
END
$$;

-- `auth` exists in Supabase. Created here only so this migration can also
-- be applied to a plain Postgres for verification; `IF NOT EXISTS` means
-- it is a no-op on Supabase.
CREATE SCHEMA IF NOT EXISTS auth;

-- Resolves the current Clerk subject, or NULL when unauthenticated.
CREATE OR REPLACE FUNCTION public.current_clerk_id()
RETURNS text
LANGUAGE sql
STABLE
-- Pinned search_path: without it, a caller could prepend a schema holding
-- their own `jwt()` and change what this function resolves to.
SET search_path = auth, pg_catalog
AS $$
  SELECT NULLIF(
    COALESCE(
      current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
      ''
    ),
    ''
  );
$$;

-- Admin membership check.
--
-- SECURITY DEFINER so a policy can consult AdminMember without the caller
-- needing any privilege on it — which is what keeps the membership table
-- itself unreadable and unwritable from a browser. EXECUTE is granted
-- narrowly rather than left open to PUBLIC.
CREATE OR REPLACE FUNCTION public.is_modus_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "AdminMember" m
    WHERE m."userId" = public.current_clerk_id()
      AND m."revokedAt" IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_modus_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_modus_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.current_clerk_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_clerk_id() TO authenticated, anon;

-- Enable RLS everywhere. A table with RLS enabled and no policy denies
-- everything, which is the correct default for the tables below that the
-- browser must never touch.
ALTER TABLE "Diagnostic"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Note"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityEvent"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminMember"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientEntitlement"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationOutbox"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GuestClaimToken"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LoginAttempt"        ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Diagnostic
-- ---------------------------------------------------------------------

-- An owner may read their own submissions. Guest rows (ownerId IS NULL)
-- match nobody: `NULL = 'user_x'` is NULL, not true, so they are not
-- readable by any signed-in user. They are reached only through the
-- server, after a verified claim.
CREATE POLICY diagnostic_select_own ON "Diagnostic"
  FOR SELECT TO authenticated
  USING ("ownerId" = public.current_clerk_id());

CREATE POLICY diagnostic_select_admin ON "Diagnostic"
  FOR SELECT TO authenticated
  USING (public.is_modus_admin());

-- An owner may create a DRAFT for themselves and nobody else. WITH CHECK
-- pins ownerId to their own subject, so a crafted ownerId in the request
-- body cannot plant a row on another account.
CREATE POLICY diagnostic_insert_own_draft ON "Diagnostic"
  FOR INSERT TO authenticated
  WITH CHECK (
    "ownerId" = public.current_clerk_id()
    AND lifecycle = 'DRAFT'
  );

-- An owner may edit their own DRAFT only, and it must still be theirs and
-- still a draft afterwards. Submitted answers become immutable from the
-- browser; promoting DRAFT -> SUBMITTED is a server operation.
CREATE POLICY diagnostic_update_own_draft ON "Diagnostic"
  FOR UPDATE TO authenticated
  USING ("ownerId" = public.current_clerk_id() AND lifecycle = 'DRAFT')
  WITH CHECK ("ownerId" = public.current_clerk_id() AND lifecycle = 'DRAFT');

-- An owner may discard their own draft. Submitted records are retained.
CREATE POLICY diagnostic_delete_own_draft ON "Diagnostic"
  FOR DELETE TO authenticated
  USING ("ownerId" = public.current_clerk_id() AND lifecycle = 'DRAFT');

-- Column grants. RLS cannot stop an owner updating `status` or the
-- pricing fields on a row they legitimately own, so those columns are
-- simply not granted. The admin pipeline writes them server-side.
GRANT SELECT ON "Diagnostic" TO authenticated;
GRANT INSERT, UPDATE ("ownerId", lifecycle, "schemaVersion", "idempotencyKey",
  "companyName", website, industry, employees, locations, "revenueRange",
  "customerChannels", "enquiryHandling", "adminWorkload", "processStandardization",
  "keyEmployeeDependency", systems, "specificTools", "systemConnectivity",
  "spreadsheetDependency", "automationUsage", "frictionAreas", "primaryPainPoint",
  "problemDescription", "problemFrequency", "impactAreas", "primaryInterest",
  priorities, timing, "decisionContext", "firstName", "lastName", email, phone,
  role, "privacyConsent", "updatedAt")
  ON "Diagnostic" TO authenticated;

-- ---------------------------------------------------------------------
-- Profile
-- ---------------------------------------------------------------------
CREATE POLICY profile_select_own ON "Profile"
  FOR SELECT TO authenticated USING (id = public.current_clerk_id());
CREATE POLICY profile_insert_own ON "Profile"
  FOR INSERT TO authenticated WITH CHECK (id = public.current_clerk_id());
CREATE POLICY profile_update_own ON "Profile"
  FOR UPDATE TO authenticated
  USING (id = public.current_clerk_id())
  WITH CHECK (id = public.current_clerk_id());

GRANT SELECT ON "Profile" TO authenticated;
GRANT INSERT ON "Profile" TO authenticated;
-- `id` is intentionally absent from the UPDATE grant: a profile may not be
-- re-pointed at another Clerk subject.
GRANT UPDATE (email, "displayName", "companyName", "updatedAt") ON "Profile" TO authenticated;

-- ---------------------------------------------------------------------
-- Admin-only reads
-- ---------------------------------------------------------------------
CREATE POLICY note_admin_all ON "Note"
  FOR ALL TO authenticated USING (public.is_modus_admin()) WITH CHECK (public.is_modus_admin());
CREATE POLICY activity_admin_select ON "ActivityEvent"
  FOR SELECT TO authenticated USING (public.is_modus_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON "Note" TO authenticated;
GRANT SELECT ON "ActivityEvent" TO authenticated;

-- ---------------------------------------------------------------------
-- Never reachable from a browser
--
-- RLS is enabled on these with no policy at all, so every client request
-- matches nothing. Privilege is also revoked, belt and braces: membership
-- and entitlement must be writable only by the server, or the whole
-- authorization model collapses.
-- ---------------------------------------------------------------------
REVOKE ALL ON "AdminMember"        FROM anon, authenticated;
REVOKE ALL ON "ClientEntitlement"  FROM anon, authenticated;
REVOKE ALL ON "NotificationOutbox" FROM anon, authenticated;
REVOKE ALL ON "GuestClaimToken"    FROM anon, authenticated;
REVOKE ALL ON "AuditEvent"         FROM anon, authenticated;
REVOKE ALL ON "LoginAttempt"       FROM anon, authenticated;

-- Anonymous visitors get no direct table access whatsoever. Guest
-- submission goes through a constrained server endpoint that validates,
-- rate-limits and bounds the payload — never a broad anon write grant.
REVOKE ALL ON "Diagnostic" FROM anon;
REVOKE ALL ON "Profile"    FROM anon;
REVOKE ALL ON "Note"       FROM anon;
