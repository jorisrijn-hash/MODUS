import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

/**
 * The shell both Clerk screens sit in.
 *
 * They were bare `<SignIn />` / `<SignUp />` on a white flex container —
 * Clerk's default card, Clerk's default typeface, Clerk's default blue
 * button. Signing in is the first authenticated moment of the product, so
 * it should not be the one screen that looks like it belongs to another
 * company.
 *
 * Everything here is the MODUS surface: the warm ground, the bare ink
 * mark, the serif display face, and the green action. The card itself is
 * styled through Clerk's `appearance` API in `clerkAppearance`, because
 * Clerk renders that subtree and cannot be reached with ordinary CSS.
 */
export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    // `pb-44` keeps the footer links clear of the consent banner, which is
    // fixed to the bottom centre of the viewport. Without it the "run a
    // diagnostic as a guest" link sat underneath the banner and could not
    // be clicked until consent was answered — found by the e2e pass, which
    // reported the banner intercepting the click.
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-paper px-6 pb-44 pt-16">
      <div className="w-full max-w-[408px]">
        {/* Bare mark, no wordmark lockup: this screen has one job and the
            brand does not need to introduce itself twice. */}
        <Link href="/" aria-label="MODUS home" className="mb-10 inline-flex">
          <LogoMark className="h-7 w-7" />
        </Link>

        <h1 className="font-serif text-[34px] leading-[1.12] tracking-[-0.015em] text-ink">
          {title}
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-graphite">{subtitle}</p>

        <div className="mt-9">{children}</div>

        <p className="mt-8 text-[13px] text-muted">{footer}</p>
      </div>
    </main>
  );
}
