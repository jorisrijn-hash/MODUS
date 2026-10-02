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
 * Whether a second factor is required for administrator access.
 *
 * INTENTIONALLY DEFERRED (user decision, 2 October 2026). Clerk's MFA is a
 * paid feature on this plan and the user chose not to enable it for this
 * phase.
 *
 * This is a RECORDED SECURITY LIMITATION, not a finished feature and not a
 * failed setup. The enforcement code below is retained and exercised by
 * tests so turning it on later is a one-line change, but with this flag
 * false the application does NOT enforce MFA. Any Google two-step
 * verification on the underlying Google account protects the Google login
 * only — it is not application-enforced MFA and must never be reported as
 * such.
 *
 * Everything else about admin access is unchanged and still strict:
 * membership is a server-controlled row, re-read on every protected
 * request, and revocation takes effect on the very next action.
 */
export const ADMIN_MFA_REQUIRED = process.env.ADMIN_MFA_REQUIRED === "true";

/**
 * Admin gate for pages, route handlers and server actions.
 *
 * Conditions, all re-checked per request:
 *   1. a verified Clerk session exists;
 *   2. that subject holds a current, unrevoked AdminMember row;
 *   3. a second factor, ONLY when ADMIN_MFA_REQUIRED is enabled.
 *
 * (3) is enforced server-side against the session claims when it applies —
 * not by hiding a menu item — so a direct request from a single-factor
 * session is rejected exactly like an anonymous one. It is currently off
 * by decision; see ADMIN_MFA_REQUIRED above.
 *
 * Never granted from an email address, an identity provider, being the
 * first signup, or anything the client can supply.
 */
export async function requireAdminSession(): Promise<{ userId: string }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new AuthorizationError("Authentication required", 401);

  if (!(await isAdmin(userId))) {
    // Same failure shape as unauthenticated, so this cannot be used to
    // discover who holds admin.
    throw new AuthorizationError("Not authorized", 403);
  }

  if (ADMIN_MFA_REQUIRED && !hasSecondFactor(sessionClaims)) {
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
