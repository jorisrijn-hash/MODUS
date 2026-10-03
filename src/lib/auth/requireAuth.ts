import { NextResponse } from "next/server";
import { AuthorizationError } from "@/lib/auth/authorize";
import { requireAdminSession } from "@/lib/auth/clerk";

/**
 * Admin gate for the private API routes.
 *
 * This used to check `isAuthenticated()` — a shared password in an
 * encrypted cookie, with no concept of *who* was signed in and no way to
 * revoke one person's access without changing the password for everyone.
 * It is now Clerk identity plus a current, server-controlled `AdminMember`
 * row, re-read on every request, so revocation takes effect on the very
 * next call rather than at the next password rotation.
 *
 * Returns the response to send when the caller is not an admin, or null
 * when they are. The two failure cases deliberately differ in status but
 * not in body: 401 when there is no verified session, 403 when there is
 * one without membership. Neither reveals whether a given account holds
 * admin.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  try {
    await requireAdminSession();
    return null;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: "Unauthorized." }, { status: error.status });
    }
    throw error;
  }
}

/**
 * The same gate, returning the verified admin's Clerk user id so a route
 * can attribute what it writes. Use this for mutations; `requireAuth` is
 * enough for reads.
 */
export async function requireAdminApi(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  try {
    const { userId } = await requireAdminSession();
    return { ok: true, userId };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized." }, { status: error.status }),
      };
    }
    throw error;
  }
}
