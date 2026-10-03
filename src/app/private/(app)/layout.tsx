import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthorizationError } from "@/lib/auth/authorize";
import { requireAdminSession } from "@/lib/auth/clerk";
import { adminDisplayName } from "@/lib/auth/adminIdentity";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "MODUS Private",
  robots: { index: false, follow: false },
};

/**
 * The admin shell is gated on Clerk identity plus a current `AdminMember`
 * row, replacing the shared-password session that used to guard it.
 *
 * Both failure modes land on the canonical Clerk sign-in rather than a
 * MODUS login form — there is no password path left to fall back to. A
 * signed-in account without membership is sent there too, which is
 * deliberate: a dedicated "you are not an admin" page would confirm to any
 * signed-in visitor that this surface exists and that they are simply
 * missing a grant.
 */
export default async function PrivateAppLayout({ children }: { children: React.ReactNode }) {
  let userId: string;
  try {
    ({ userId } = await requireAdminSession());
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect(`/sign-in?redirect_url=${encodeURIComponent("/private")}`);
    }
    throw error;
  }

  return <AdminShell username={await adminDisplayName(userId)}>{children}</AdminShell>;
}
