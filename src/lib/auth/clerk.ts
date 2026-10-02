import { auth } from "@clerk/nextjs/server";
import { AuthorizationError, isAdmin, type Identity } from "./authorize";

/**
 * Bridges the verified Clerk session into the application's own
 * authorization model.
 *
 * Clerk answers "who is this". It never answers "what may they reach" —
 * that is `authorize.ts`, reading server-controlled tables. Keeping the two
 * apart is the point: signing up must grant nothing.
 */

/** The verified subject, or null. Never trusts a client-supplied id. */
export async function currentIdentity(): Promise<Identity> {
  // Next 15+: auth() is async.
  const { userId } = await auth();
  return userId ? { userId } : null;
}

/**
 * Admin gate for pages, route handlers and server actions.
 *
 * Three independent conditions, all re-checked per request:
 *   1. a verified Clerk session exists;
 *   2. that subject holds a current, unrevoked AdminMember row;
 *   3. the session was verified with a second factor.
 *
 * (3) is enforced HERE, server-side, against the session claims — not by
 * hiding a menu item and not by a client-side check. A direct request to a
 * protected endpoint from a single-factor session is rejected the same as
 * an anonymous one.
 */
export async function requireAdminSession(): Promise<{ userId: string }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new AuthorizationError("Authentication required", 401);

  if (!(await isAdmin(userId))) {
    // Same failure shape as unauthenticated, so this cannot be used to
    // discover who holds admin.
    throw new AuthorizationError("Not authorized", 403);
  }

  if (!hasSecondFactor(sessionClaims)) {
    throw new AuthorizationError(
      "Multi-factor authentication is required for administrator access.",
      403
    );
  }

  return { userId };
}

/**
 * Reads the verification level from the session claims.
 *
 * Clerk reports the factor-verification age/level in `fva` as
 * `[firstFactorAge, secondFactorAge]`, where -1 means "not verified in this
 * session". A second-factor age of -1, or a missing claim, is treated as
 * NOT satisfied — the safe direction, because the failure mode of guessing
 * the other way is an admin endpoint open to a single-factor session.
 */
function hasSecondFactor(claims: unknown): boolean {
  const fva = (claims as { fva?: unknown } | null)?.fva;
  if (!Array.isArray(fva) || fva.length < 2) return false;
  const secondFactorAge = Number(fva[1]);
  return Number.isFinite(secondFactorAge) && secondFactorAge >= 0;
}

/**
 * Ensures an application Profile row exists for the signed-in user.
 *
 * Created on demand rather than depending on a Clerk webhook having
 * already arrived: a delayed or retried webhook must never make a first
 * sign-in fail. The webhook, when it lands, updates the same row.
 */
export async function ensureProfile(userId: string, email?: string | null) {
  const { prisma } = await import("@/lib/db");
  return prisma.profile.upsert({
    where: { id: userId },
    create: { id: userId, email: email ?? null },
    update: email ? { email } : {},
  });
}
