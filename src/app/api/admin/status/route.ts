import { NextResponse } from "next/server";
import { AuthorizationError } from "@/lib/auth/authorize";
import { requireAdminSession } from "@/lib/auth/clerk";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Whether the *caller* currently holds admin membership.
 *
 * Deliberately answers only about the verified session making the
 * request: it takes no user id and cannot be asked about anyone else, so
 * it cannot be used to enumerate who holds admin. Both "not signed in"
 * and "signed in without membership" return the same `{ admin: false }`.
 *
 * This exists so the MODUS tab can offer the admin inbox after sign-in
 * without guessing from the client. It is a hint for the UI and grants
 * nothing: `/private` re-checks membership server-side on every request,
 * so a forged `{ admin: true }` here opens a tab that then redirects
 * straight back to sign-in.
 */
export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json({ admin: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ admin: false }, { headers: { "Cache-Control": "no-store" } });
    }
    throw error;
  }
}
