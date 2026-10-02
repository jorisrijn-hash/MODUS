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

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  if (!session.username || !session.loggedInAt) return false;
  const ageMs = Date.now() - session.loggedInAt;
  return ageMs < SESSION_HOURS * 60 * 60 * 1000;
}
