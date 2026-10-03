import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The WIRED admin surface, exercised through the real route handlers.
 *
 * `authorize.test.ts` covers the authorization rules in isolation. These
 * cover that the rules are actually attached to the routes a browser can
 * reach — which is the thing that was missing: the helpers existed and
 * were tested while `/private` was still guarded by a shared password and
 * no route called them at all.
 *
 * Clerk's `auth()` is the one thing stubbed, standing in for a verified
 * session. Membership is read through the ordinary `prisma` path, so the
 * active/revoked cases run against the same query the application uses.
 */

const authState: { userId: string | null } = { userId: null };

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: authState.userId, sessionClaims: {} }),
}));

// A mutable flag rather than a per-test `doMock`: unmocking it mid-file
// restored the REAL implementation, which reads env that is unset under
// test, so every later case saw "provider not configured" and answered 401
// where it should have answered 403.
const clerkConfig = { configured: true };
vi.mock("@/lib/auth/clerkConfig", () => ({
  isClerkConfigured: () => clerkConfig.configured,
  isClerkPubliclyConfigured: () => clerkConfig.configured,
}));

type AdminRow = { userId: string; revokedAt: Date | null };
const adminRows: AdminRow[] = [];

vi.mock("@/lib/db", () => ({
  prisma: {
    adminMember: {
      findFirst: async ({ where }: { where: { userId?: string; revokedAt?: null } }) =>
        adminRows.find((r) => r.userId === where.userId && r.revokedAt === null) ?? null,
    },
    diagnostic: {
      findMany: async () => [],
      count: async () => 0,
      findUnique: async () => null,
      groupBy: async () => [],
    },
    diagnosticNote: { findMany: async () => [], create: async () => ({}) },
    activityEvent: { findMany: async () => [], create: async () => ({}) },
  },
}));

const ADMIN = "user_admin_authorized";
const ORDINARY = "user_ordinary_customer";

function signIn(userId: string | null) {
  authState.userId = userId;
}

function grantAdmin(userId: string) {
  adminRows.push({ userId, revokedAt: null });
}

function revokeAdmin(userId: string) {
  const row = adminRows.find((r) => r.userId === userId && r.revokedAt === null);
  if (row) row.revokedAt = new Date();
}

beforeEach(() => {
  authState.userId = null;
  adminRows.length = 0;
  clerkConfig.configured = true;
});

describe("the private API is gated on Clerk identity plus current membership", () => {
  it("denies an anonymous caller with 401", async () => {
    const { requireAuth } = await import("@/lib/auth/requireAuth");
    signIn(null);
    const res = await requireAuth();
    expect(res?.status).toBe(401);
  });

  it("denies an ordinary signed-in account with 403", async () => {
    const { requireAuth } = await import("@/lib/auth/requireAuth");
    signIn(ORDINARY);
    const res = await requireAuth();
    expect(res?.status).toBe(403);
    // Same body as the 401, so this cannot be used to discover who is an
    // admin by probing.
    expect(await res!.json()).toEqual({ error: "Unauthorized." });
  });

  it("admits an account holding a current membership", async () => {
    const { requireAuth } = await import("@/lib/auth/requireAuth");
    signIn(ADMIN);
    grantAdmin(ADMIN);
    expect(await requireAuth()).toBeNull();
  });

  it("denies a revoked admin on the very next request", async () => {
    const { requireAuth } = await import("@/lib/auth/requireAuth");
    signIn(ADMIN);
    grantAdmin(ADMIN);
    expect(await requireAuth()).toBeNull();

    // No sign-out, no new session, no cache to wait out: the membership
    // is re-read per request, so the next call is already denied.
    revokeAdmin(ADMIN);
    const after = await requireAuth();
    expect(after?.status).toBe(403);
  });

  it("fails closed when the provider is not configured", async () => {
    const { requireAuth } = await import("@/lib/auth/requireAuth");
    signIn(ADMIN);
    grantAdmin(ADMIN);
    clerkConfig.configured = false;
    try {
      // An unconfigured deployment must deny everyone, never wave them past.
      expect((await requireAuth())?.status).toBe(401);
    } finally {
      clerkConfig.configured = true;
    }
  });
});

describe("the real route handlers carry the gate", () => {
  /*
   * Imported and invoked directly. If a handler ever loses its guard —
   * the failure that let the admin inbox sit behind a shared password
   * while the Clerk code was written and unused — these fail.
   */
  const routes: { name: string; call: (req: Request) => Promise<Response> }[] = [
    {
      name: "GET /api/private/diagnostics",
      call: async (r) => (await import("@/app/api/private/diagnostics/route")).GET(r as never),
    },
    {
      name: "GET /api/private/overview",
      call: async () => (await import("@/app/api/private/overview/route")).GET(),
    },
    {
      name: "GET /api/private/diagnostics/export",
      call: async (r) => (await import("@/app/api/private/diagnostics/export/route")).GET(r as never),
    },
  ];

  for (const route of routes) {
    it(`${route.name} denies anonymous, denies an ordinary account, admits an admin`, async () => {
      const request = new Request("http://localhost/api/private/diagnostics");

      signIn(null);
      expect((await route.call(request)).status, "anonymous").toBe(401);

      signIn(ORDINARY);
      expect((await route.call(request)).status, "ordinary account").toBe(403);

      signIn(ADMIN);
      grantAdmin(ADMIN);
      expect((await route.call(request)).status, "active admin").toBe(200);

      revokeAdmin(ADMIN);
      expect((await route.call(request)).status, "revoked admin").toBe(403);
    });
  }
});

describe("customer-facing accounts cannot reach private notes", () => {
  it("rejects an ordinary account on the notes route, for both read and write", async () => {
    const mod = await import("@/app/api/private/diagnostics/[id]/notes/route");
    const params = { params: Promise.resolve({ id: "diag_1" }) };
    const noteRequest = () =>
      new Request("http://localhost/api/private/diagnostics/diag_1/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "internal pricing note" }),
      }) as never;

    signIn(ORDINARY);
    expect((await mod.POST(noteRequest(), params)).status, "ordinary account").toBe(403);

    signIn(null);
    expect((await mod.POST(noteRequest(), params)).status, "anonymous").toBe(401);

    // And the record the note hangs off is equally closed.
    const detail = await import("@/app/api/private/diagnostics/[id]/route");
    signIn(ORDINARY);
    expect((await detail.GET(noteRequest(), params)).status, "ordinary reading a record").toBe(403);
    expect((await detail.DELETE(noteRequest(), params)).status, "ordinary deleting a record").toBe(403);
  });
});
