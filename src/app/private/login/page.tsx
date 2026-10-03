import { redirect } from "next/navigation";

export const metadata = { robots: { index: false, follow: false } };

/**
 * The MODUS admin password login is gone. `/private` is gated on Clerk
 * identity plus an `AdminMember` row, and keeping a second way in would
 * have been exactly the password bypass this replaced.
 *
 * The path is kept as a redirect rather than deleted so existing
 * bookmarks and links land on the canonical Clerk sign-in instead of a
 * 404. `LoginForm` and `/api/private/login` are deleted outright.
 */
export default function PrivateLoginPage() {
  redirect(`/sign-in?redirect_url=${encodeURIComponent("/private")}`);
}
