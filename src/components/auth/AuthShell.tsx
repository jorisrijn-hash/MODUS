"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LogoMark } from "@/components/ui/Logo";

/**
 * The MODUS surface both Clerk screens sit on, and the morph between
 * them.
 *
 * What is shared is genuinely shared: this component is mounted by the
 * `(auth)` layout, so navigating between `/sign-in` and `/sign-up` never
 * unmounts the mark, the heading block or the card. Only the words and
 * the Clerk form inside change, and the card animates its own height to
 * whatever the new form needs.
 *
 * The content is keyed on the pathname so the old copy can leave while
 * the new copy arrives, with `mode="popLayout"` so the outgoing text is
 * taken out of flow and the two never stack. The form itself is NOT
 * keyed: Clerk owns that subtree, and re-mounting it on every navigation
 * would throw away in-progress state and any provider handshake.
 */

const COPY = {
  "/sign-in": {
    title: "Sign in to MODUS.",
    subtitle: "Pick up your diagnostic where you left it.",
    footerLead: "New here?",
    footerHref: "/sign-up",
    footerLink: "Create an account",
  },
  "/sign-up": {
    title: "Create your MODUS account.",
    subtitle: "Save your progress and return with a clearer picture.",
    footerLead: "Already have one?",
    footerHref: "/sign-in",
    footerLink: "Sign in",
  },
} as const;

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/sign-in";
  const key = pathname.startsWith("/sign-up") ? "/sign-up" : "/sign-in";
  const copy = COPY[key];
  const reduced = useReducedMotion();

  // Reduced motion gets the same layout, arrived at immediately. The
  // request is for no motion, not for a different screen.
  const ease = [0.16, 1, 0.3, 1] as const;
  const swap = reduced
    ? { duration: 0 }
    : { duration: 0.42, ease };

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-paper px-6 pb-44 pt-16">
      <div className="w-full max-w-[408px]">
        {/* Never keyed, never unmounted: the one element that is
            identical on both screens and therefore should not move. */}
        <Link href="/" aria-label="MODUS home" className="mb-10 inline-flex">
          <LogoMark className="h-7 w-7" />
        </Link>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={key}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={swap}
          >
            <h1 className="text-balance font-serif text-[34px] leading-[1.12] tracking-[-0.015em] text-ink">
              {copy.title}
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-graphite">{copy.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/*
         * `layout` animates the height change between the sign-in form and
         * the taller sign-up form, so the surface grows into place instead
         * of snapping. The form inside is not keyed or re-mounted.
         */}
        <motion.div layout={!reduced} transition={swap} className="mt-9">
          {children}
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`${key}-footer`}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={swap}
            className="mt-8 text-[13px] text-muted"
          >
            {copy.footerLead}{" "}
            <Link
              href={copy.footerHref}
              className="rounded-sm text-modus underline underline-offset-4 transition-colors hover:text-modus-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-modus"
            >
              {copy.footerLink}
            </Link>
            . You can also{" "}
            <Link
              href="/diagnostic"
              className="rounded-sm text-modus underline underline-offset-4 transition-colors hover:text-modus-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-modus"
            >
              run a diagnostic as a guest
            </Link>
            .
          </motion.p>
        </AnimatePresence>
      </div>
    </main>
  );
}
