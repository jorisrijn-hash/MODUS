import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Shared shell for `/sign-in` and `/sign-up`.
 *
 * The two routes previously rendered their own copy of the shell, so
 * moving between them unmounted everything and the whole page
 * cross-faded. Holding the shell in a layout that spans both routes means
 * the mark, the heading block and the card surface are never unmounted:
 * the heading and copy swap in place and the surface resizes to the new
 * form, which is the morph rather than a page transition.
 *
 * A route group, so the URLs stay `/sign-in` and `/sign-up` exactly as
 * before — real routes, real history entries, working browser Back.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
