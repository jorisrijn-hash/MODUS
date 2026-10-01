"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import { WideBleed } from "@/components/ui/Container";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { NavUtilityMenu } from "@/components/ui/NavUtilityMenu";
import { ClientUserButton } from "@/components/client/ClientUserButton";
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Fragment, not the <header> itself, is the outermost element —
    // MarketingMobileNav must NOT be a descendant of <header> (see below
    // for why this matters, it's not arbitrary).
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-modus ${
          scrolled || mobileOpen
            ? "border-line bg-paper/90 backdrop-blur-sm"
            : "border-transparent bg-transparent"
        }`}
      >
      <WideBleed>
        <div
          className={`flex items-center justify-between transition-all duration-300 ease-modus ${
            scrolled ? "h-14" : "h-20"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <Link href="/" aria-label="MODUS home" className="flex items-center gap-2.5">
              <LogoMark className="h-5 w-5" />
              <Logo variant="wordmark" />
            </Link>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden items-center gap-8 lg:flex"
            aria-label="Primary"
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[13px] transition-colors ${
                    active ? "text-ink" : "text-graphite hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <NavUtilityMenu className="hidden lg:block" />
            <ClientUserButton className="hidden lg:flex" />

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
       * bug found live (Checkpoint 3): <header> gets `backdrop-blur-sm`
       * (a `backdrop-filter`) applied whenever `mobileOpen` is true —
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
