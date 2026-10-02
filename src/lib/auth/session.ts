import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type SessionData = {
  username?: string;
  loggedInAt?: number;
};

const SESSION_HOURS = 10;

/**
 * Reads the session secret. Called lazily, per request — never at module
 * scope.
 *
 * This used to run at import time, via `export const sessionOptions =
 * { password: secret(), ... }`. That made importing this module throw
 * whenever SESSION_SECRET was absent, and Next.js imports every route
 * module during "Collecting page data" — so a missing admin secret failed
 * the entire production build with:
 *
 *   Failed to collect page data for /api/private/logout
 *   cause: SESSION_SECRET is missing or too short
 *
 * which is how a deployment with no env vars configured ends up serving
 * nothing at all and the domain returns 404. The public marketing site has
 * no business failing to build because an internal-admin secret is unset.
 *
 * The check itself is unchanged and still strict: /private is simply
 * unreachable, loudly, at request time rather than at build time.
 */
function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set a 32+ byte secret in .env (see .env.example)."
    );
  }
  return s;
}

function sessionOptions(): SessionOptions {
  return {
    password: secret(),
    cookieName: "modus_private_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_HOURS * 60 * 60,
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions());
}

/**
 * Is a usable session secret present?
 *
 * Read paths use this to answer "is anyone signed in" without throwing.
 * Write paths (minting a session at login) deliberately still throw via
 * `secret()`, so a server with a missing or weak secret can never issue
 * one — it simply cannot authenticate anybody.
 */
function sessionSecretAvailable(): boolean {
  const s = process.env.SESSION_SECRET;
  return Boolean(s && s.length >= 32);
}

export async function isAuthenticated(): Promise<boolean> {
  // Fails CLOSED and QUIETLY. Without a secret nobody can be signed in, so
  // the honest answer is "no" — not an unhandled 500. Protected pages then
  // redirect to login like any signed-out visitor, instead of crashing and
  // leaking a stack trace. No access is granted by this path.
  if (!sessionSecretAvailable()) return false;
  const session = await getSession();
  if (!session.username || !session.loggedInAt) return false;
  const ageMs = Date.now() - session.loggedInAt;
  return ageMs < SESSION_HOURS * 60 * 60 * 1000;
}
