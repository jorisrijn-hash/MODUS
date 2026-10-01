import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type SessionData = {
  username?: string;
  loggedInAt?: number;
};

const SESSION_HOURS = 10;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set a 32+ byte secret in .env (see .env.example)."
    );
  }
  return s;
}

export const sessionOptions: SessionOptions = {
  password: secret(),
  cookieName: "modus_private_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_HOURS * 60 * 60,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  if (!session.username || !session.loggedInAt) return false;
  const ageMs = Date.now() - session.loggedInAt;
  return ageMs < SESSION_HOURS * 60 * 60 * 1000;
}
