import { prisma } from "@/lib/db";

/**
 * Server-side authorization.
 *
 * Three rules this module exists to enforce, because getting any of them
 * wrong collapses the whole model:
 *
 *  1. Authentication is never an admin check. Being signed in proves who
 *     you are, nothing about what you may reach.
 *  2. Admin membership is read from the database on EVERY protected
 *     request, never from a token claim. A claim cannot be revoked until
 *     it expires; a row can be revoked immediately, and the next action
 *     fails.
 *  3. Nothing here ever trusts a client-supplied user id, role, owner
 *     field or email domain. The caller passes the subject it got from
 *     the verified session, and that is the only identity considered.
 */

export type Identity = { userId: string } | null;

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 = 403
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Is this verified subject a current MODUS administrator? */
export async function isAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const member = await prisma.adminMember.findFirst({
    where: { userId, revokedAt: null },
    select: { id: true },
  });
  return member !== null;
}

/**
 * Throws unless the subject is a current administrator. Use this in the
 * page, the route handler, the server action AND the data read — each is
 * independently reachable, so each has to check. Hiding a UI control is
 * not an authorization boundary.
 */
export async function requireAdmin(identity: Identity): Promise<{ userId: string }> {
  if (!identity) throw new AuthorizationError("Authentication required", 401);
  if (!(await isAdmin(identity.userId))) {
    // Deliberately the same shape of failure as "not signed in" from the
    // caller's perspective, so this endpoint cannot be used to enumerate
    // who is an admin.
    throw new AuthorizationError("Not authorized", 403);
  }
  return { userId: identity.userId };
}

/** Does this subject hold a current entitlement to a client workspace? */
export async function hasClientAccess(
  userId: string | null | undefined,
  scope: string
): Promise<boolean> {
  if (!userId) return false;
  const row = await prisma.clientEntitlement.findFirst({
    where: { userId, scope, revokedAt: null },
    select: { id: true },
  });
  return row !== null;
}

/**
 * Ownership check for a diagnostic.
 *
 * Guest records (ownerId null) are owned by nobody and are never matched
 * here — they are reached only through a verified claim, never by someone
 * typing the same email address.
 */
export async function ownsDiagnostic(
  userId: string | null | undefined,
  diagnosticId: string
): Promise<boolean> {
  if (!userId) return false;
  const row = await prisma.diagnostic.findFirst({
    where: { id: diagnosticId, ownerId: userId },
    select: { id: true },
  });
  return row !== null;
}

/** Append-only record of a consequential administrative action. */
export async function auditAdminAction(
  actorId: string,
  action: string,
  subjectId?: string,
  detail?: string
): Promise<void> {
  await prisma.auditEvent.create({
    // Deliberately records WHAT changed, never the submission's answers
    // or any secret.
    data: { actorId, action, subjectId, detail },
  });
}
