import { prisma } from "@/lib/db";

/**
 * A human label for the signed-in administrator.
 *
 * The admin shell used to show `session.username`, which came from the
 * shared password login and was the same string for everybody. With Clerk
 * the surface is per-person, so this prefers the email on the application's
 * own `Profile` row and falls back to the Clerk user id — never to a
 * generic "Admin", which would hide which account is actually acting.
 */
export async function adminDisplayName(userId: string): Promise<string> {
  const profile = await prisma.profile
    .findUnique({ where: { id: userId }, select: { email: true } })
    .catch(() => null);
  return profile?.email ?? userId;
}
