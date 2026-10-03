"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AuthControls } from "@/components/auth/AuthControls";
import { LanguageSwitch } from "@/components/language/LanguageSwitch";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { DiagnosticCTA } from "@/components/ui/DiagnosticCTA";
import { useDict } from "@/lib/i18n/context";

type NavLink = { label: string; href: string };

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Full-screen marketing mobile menu — Checkpoint 3, Section 6. A
 * genuinely separate design from the desktop nav's link row, not a
 * shrunk copy: large editorial type, generous spacing, staggered
 * entrance. Distinct from `/app`'s own `MobileNav.tsx` (a different
 * component for a different, functional-product-shell context — see
 * MODUS_REDESIGN_REPORT.md's Checkpoint 3 provider-boundary notes).
 *
 * Accessibility, built explicitly rather than assumed: scroll lock,
 * Escape-to-close, a basic Tab/Shift+Tab focus trap between the panel's
 * first and last focusable elements, focus moved to the close button on
 * open and restored to whatever triggered it on close, `aria-hidden`
 * withheld from the trigger's own button (handled by the caller) but the
 * background page content is inert to pointer/scroll interaction while
 * this is open (full-viewport opaque panel + scroll lock, not a
 * see-through backdrop someone could click through).
 */
export function MarketingMobileNav({
  open,
  onClose,
  links,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const dict = useDict();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const triggerEl = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerEl?.focus();
    };
  }, [open, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={dict.nav.openMenu}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[70] flex flex-col bg-paper lg:hidden"
        >
          <div className="flex items-center justify-end px-6 pt-6 sm:px-8">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center text-ink"
              aria-label={dict.nav.closeMenu}
            >
              <span className="relative block h-4 w-4">
                <span className="absolute left-1/2 top-1/2 h-[1.5px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink" />
                <span className="absolute left-1/2 top-1/2 h-[1.5px] w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink" />
              </span>
            </button>
          </div>

          <motion.nav
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-1 flex-col justify-center gap-1 px-6 sm:px-8"
            aria-label="Mobile"
          >
            {links.map((link) => (
              <motion.div key={link.href} variants={itemVariants}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block border-b border-line py-4 text-[32px] font-semibold leading-none tracking-[-0.01em] text-ink"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 border-t border-line px-6 pb-8 pt-6 sm:px-8"
          >
            <div className="flex items-center justify-between">
              <ThemeSwitch />
              <LanguageSwitch />
            </div>
            <AuthControls variant="mobile" onNavigate={onClose} />
            <DiagnosticCTA variant="hero" source="mobile_nav" className="w-full justify-center" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
