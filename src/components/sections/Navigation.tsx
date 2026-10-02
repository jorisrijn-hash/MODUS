"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import { WideBleed } from "@/components/ui/Container";
import { Logo, LogoTile } from "@/components/ui/Logo";
import { LogoLockup } from "@/components/ui/LogoLockup";
import { NavUtilityMenu } from "@/components/ui/NavUtilityMenu";
import { AnimatedChars } from "@/components/ui/AnimatedChars";
import { AuthControls } from "@/components/auth/AuthControls";
import { DiagnosticCTA } from "@/components/ui/DiagnosticCTA";
import { MarketingMobileNav } from "@/components/sections/MarketingMobileNav";
import { useDict } from "@/lib/i18n/context";

/**
 * Marketing global navigation — Checkpoint 3 redesign. Same information
 * architecture as before (six section links, language switch, client
 * auth, the personalized Diagnostic CTA), restyled per the V2 art
 * direction: quiet/transparent at rest, a restrained scroll reaction
 * (unchanged height/blur mechanism, just retimed), precise (not
 * decorative) hover states, and the Checkpoint 1 theme switch given a
 * real, minimal placement here rather than only living on the internal
 * test surface. Mobile gets a genuinely separate full-screen menu
 * (`MarketingMobileNav`), not a shrunk dropdown.
 */
export function Navigation() {
  const dict = useDict();
  // Checkpoint 5.5 — reduced from 6 primary links to 4 (calmer nav, per
  // the visual-direction reset). Platform and Company aren't dropped from
  // the site, just from this top-level row — both remain fully reachable
  // via the footer's own complete link set.
  const links = [
    { label: dict.nav.howItWorks, href: "/how-it-works" },
    { label: dict.nav.capabilities, href: "/capabilities" },
    { label: dict.nav.results, href: "/results" },
    { label: dict.nav.pricing, href: "/pricing" },
  ];
  // Mobile keeps the full set (nothing lost on the one surface built to
  // hold more), matching the previous MarketingMobileNav contract exactly.
  const mobileLinks = [
    { label: dict.nav.howItWorks, href: "/how-it-works" },
    { label: dict.nav.platform, href: "/platform" },
    { label: dict.nav.pricing, href: "/pricing" },
    { label: dict.nav.capabilities, href: "/capabilities" },
    { label: dict.nav.results, href: "/results" },
    { label: dict.nav.company, href: "/company" },
  ];
  // The old `scrolled` state (which swapped the header to an opaque bar
  // with a bottom rule and shrank its height) is gone. The reference's
  // header does not react to scroll at all — the only scroll reaction is
  // the centre lockup's collapse, which owns its own listener inside
  // LogoLockup. Keeping a second scroll listener here to animate chrome
  // that no longer changes would be dead work on every frame.
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  return (
    // Fragment, not the <header> itself, is the outermost element —
    // MarketingMobileNav must NOT be a descendant of <header> (see below
    // for why this matters, it's not arbitrary).
    <>
      {/*
       * Restrained capsule navigation, per the reference: separate quiet
       * pills floating over the ground rather than one opaque bar with a
       * bottom rule. `backdrop-blur` lives on the capsules, never on
       * <header> itself — see the containing-block note further down,
       * which is exactly why that distinction matters here.
       */}
      <header className="fixed inset-x-0 top-0 z-50">
      <WideBleed>
        <div className="relative flex h-20 items-center justify-between">
          {/* Left: information links. */}
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden items-center gap-7 rounded-full border border-line/70 bg-surface/80 px-6 py-2.5 backdrop-blur-sm lg:flex"
            aria-label="Primary"
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  // Text link: character roll only. No background layer —
                  // adding a surface to a plain nav link purely to carry
                  // the inset animation would change the navigation's
                  // appearance, which this pass must not do.
                  data-chars-root=""
                  className={`text-[13px] transition-colors ${
                    active ? "text-ink" : "text-graphite hover:text-ink"
                  }`}
                >
                  <AnimatedChars text={link.label} />
                </Link>
              );
            })}
          </motion.nav>

          {/* Mobile-only brand, left-aligned: the centred capsule is a
              desktop composition and would collide with the menu trigger
              at 390px. */}
          <Link href="/" aria-label="MODUS" className="flex items-center gap-2.5 lg:hidden">
            <LogoTile className="h-[22px] w-[22px]" />
            <Logo variant="wordmark" />
          </Link>

          {/* Centre: the collapsing lockup. Absolutely positioned and
              translated about its own centre, so condensing it never
              shifts the two groups either side. */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <LogoLockup className="top-1/2 -translate-y-1/2" />
          </motion.div>

          {/* Right: account, preferences, and the real diagnostic action. */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 rounded-full border border-line/70 bg-surface/80 py-1.5 pl-3 pr-1.5 backdrop-blur-sm lg:gap-3"
          >
            <NavUtilityMenu className="hidden lg:block" />
            {/* Clerk owns identity. The old mock ClientUserButton is
                replaced here rather than shown alongside, so there is one
                account control and one identity. */}
            <AuthControls className="hidden lg:flex" />

            <DiagnosticCTA variant="nav" source="nav" magnetic className="hidden sm:inline-flex" />

            <button
              ref={menuTriggerRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-label={dict.nav.openMenu}
              className="flex h-9 w-9 items-center justify-center text-ink lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </motion.div>
        </div>
      </WideBleed>
      </header>

      {/*
       * Deliberately a sibling of <header>, not nested inside it. A real
       * bug found live (Checkpoint 3): <header> then carried
       * `backdrop-blur-sm` (a `backdrop-filter`) —
       * and per the CSS spec, `backdrop-filter` (like `transform` or
       * `filter`) creates a new *containing block* for any
       * `position: fixed` descendant. With MarketingMobileNav previously
       * nested inside <header>, its own `fixed inset-0` resolved against
       * <header>'s own ~56-80px height instead of the viewport —
       * collapsing the "full-screen" menu down to a sliver and letting
       * page content show through underneath. Confirmed via
       * getComputedStyle (height computed to 80px, not the viewport
       * height) before this was understood as the real cause, not
       * assumed from the visual symptom alone. Moving it here, outside
       * <header> entirely, removes the containing-block conflict.
       */}
      <MarketingMobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={mobileLinks}
        triggerRef={menuTriggerRef}
      />
    </>
  );
}
