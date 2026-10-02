-- Hardens Prisma's own migration-history table.
--
-- Supabase flags `public._prisma_migrations` as exposed without RLS. It is
-- created by Prisma, not by our schema, so the earlier "RLS on 10/10
-- application tables" result did not cover it — it is a separate finding.
--
-- It leaks nothing dramatic (migration names, checksums, timestamps) but
-- it is schema reconnaissance that no browser client has any reason to
-- read, and it sits in the API-exposed `public` schema.
--
-- Idempotent on purpose: this was first applied by hand in the Supabase
-- SQL editor, so it must be safe to re-apply, and it must also run on a
-- brand-new environment that has never seen it.
--
-- Prisma keeps working because it connects as the table OWNER, and an
-- owner bypasses RLS unless FORCE ROW LEVEL SECURITY is set — which is
-- deliberately NOT set here. Verified after applying: `prisma migrate
-- status` and `prisma migrate deploy` both still function.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
  ) THEN
    -- No policy is added. RLS enabled with zero policies denies every
    -- non-owner role outright, which is exactly what is wanted: there is
    -- no legitimate browser access to grant.
    EXECUTE 'ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY';

    -- Belt and braces alongside RLS: revoke the privilege itself, so the
    -- table is unreachable even if a future default-privilege grant
    -- re-adds access for the API roles.
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public._prisma_migrations FROM PUBLIC';
    -- Guarded: these roles exist on Supabase but not on a plain Postgres.
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public._prisma_migrations FROM anon';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public._prisma_migrations FROM authenticated';
    END IF;
  END IF;
END
$$;
