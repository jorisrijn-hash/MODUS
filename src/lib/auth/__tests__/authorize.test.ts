import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Authorization rules, tested against the real query layer with the
 * database mocked.
 *
 * These matter more, not less, now that application-enforced MFA is
 * deferred: membership is the only thing standing between an ordinary
 * account and the submission inbox.
 */

const findFirst = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    adminMember: { findFirst: (...a: unknown[]) => findFirst(...a) },
    clientEntitlement: { findFirst: (...a: unknown[]) => findFirst(...a) },
    diagnostic: { findFirst: (...a: unknown[]) => findFirst(...a) },
    auditEvent: { create: vi.fn() },
  },
}));

const { isAdmin, requireAdmin, hasClientAccess, ownsDiagnostic, AuthorizationError } = await import(
  "../authorize"
);

beforeEach(() => findFirst.mockReset());

describe("admin membership", () => {
  it("rejects an anonymous caller with 401", async () => {
    await expect(requireAdmin(null)).rejects.toMatchObject({ status: 401 });
  });

  it("rejects a signed-in account that holds no membership with 403", async () => {
    findFirst.mockResolvedValue(null);
    await expect(requireAdmin({ userId: "user_ordinary" })).rejects.toBeInstanceOf(
      AuthorizationError
    );
    await expect(requireAdmin({ userId: "user_ordinary" })).rejects.toMatchObject({ status: 403 });
  });

  it("admits a subject holding a current membership", async () => {
    findFirst.mockResolvedValue({ id: "m1" });
    await expect(requireAdmin({ userId: "user_admin" })).resolves.toEqual({ userId: "user_admin" });
  });

  it("only ever matches an UNREVOKED row", async () => {
    findFirst.mockResolvedValue(null);
    await isAdmin("user_admin");
    // Revocation must take effect on the next request, so the query has to
    // filter on revokedAt — not merely on the user id.
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user_admin", revokedAt: null }),
      })
    );
  });

  it("treats a missing subject as not admin without querying", async () => {
    expect(await isAdmin(null)).toBe(false);
    expect(await isAdmin(undefined)).toBe(false);
    expect(findFirst).not.toHaveBeenCalled();
  });
});

describe("client entitlement is separate from admin", () => {
  it("requires an explicit unrevoked grant for the exact scope", async () => {
    findFirst.mockResolvedValue(null);
    expect(await hasClientAccess("user_x", "workspace_a")).toBe(false);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user_x", scope: "workspace_a", revokedAt: null }),
      })
    );
  });

  it("does not consult admin membership", async () => {
    findFirst.mockResolvedValue({ id: "e1" });
    expect(await hasClientAccess("user_x", "workspace_a")).toBe(true);
    // Being a client must never imply platform admin, so the two reads are
    // independent lookups against different tables.
    expect(findFirst).toHaveBeenCalledTimes(1);
  });
});

describe("diagnostic ownership", () => {
  it("never matches a guest record for a signed-in user", async () => {
    findFirst.mockResolvedValue(null);
    expect(await ownsDiagnostic("user_x", "diag_guest")).toBe(false);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "diag_guest", ownerId: "user_x" } })
    );
  });

  it("returns false for an anonymous caller without querying", async () => {
    expect(await ownsDiagnostic(null, "diag_1")).toBe(false);
    expect(findFirst).not.toHaveBeenCalled();
  });
});
