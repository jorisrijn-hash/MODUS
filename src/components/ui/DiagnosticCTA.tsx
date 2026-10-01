"use client";

import Link from "next/link";
import { useCustomerContext } from "@/lib/customerContext/useCustomerContext";
import { useDict } from "@/lib/i18n/context";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { track } from "@/lib/chatbot";

type Variant = "nav" | "hero" | "inline" | "dark" | "footer" | "accent-invert" | "hero-round";

const VARIANT_CLASS: Record<Variant, string> = {
  nav: "rounded bg-modus px-4 py-2 text-[13px] font-medium text-modus-foreground hover:bg-modus-light",
  hero: "rounded bg-modus px-6 py-3.5 text-[14px] font-medium text-modus-foreground hover:bg-modus-light",
  inline: "rounded bg-modus px-5 py-2.5 text-[13px] font-medium text-modus-foreground hover:bg-modus-light",
  // "dark" = a highlighted pill CTA placed on a dark/inverted section
  // (e.g. a future Philosophy-style dark section, Checkpoint 4+) — a
  // bordered outline rather than the usual solid modus-green fill, which
  // would otherwise read as a green pill on a near-black background.
  // Uses the fixed inverted-foreground token (not paper), since this
  // sits on a section that's meant to stay dark regardless of site
  // theme — see globals.css's --surface-inverted comment.
  dark: "rounded border border-inverted-foreground/30 px-6 py-3.5 text-[14px] font-medium text-inverted-foreground hover:border-inverted-foreground/60",
  // "footer" = a plain text link matching the footer's own nav-column
  // list style, not a pill — the footer already has enough visual weight
  // from its own layout; every diagnostic action there reads as a link
  // alongside "Talk to MODUS", not a second competing button.
  footer: "text-[13.5px] font-normal text-inverted-foreground/70 hover:text-inverted-foreground",
  // "accent-invert" = a solid pill that inverts *away* from a `bg-modus`
  // section (FinalCTA), not a full-page-always-dark one — uses the
  // ordinary theme-relative `paper`/`ink` tokens deliberately, not the
  // fixed inverted ones: paper/ink swap correctly with the site theme
  // (near-white/near-black in light mode, near-black/near-white in dark
  // mode), which happens to always contrast correctly against whichever
  // shade of green `bg-modus` currently resolves to in either theme. A
  // real mistake caught before shipping: `footer`'s fixed
  // inverted-foreground text on this section would stay near-white even
  // in dark mode, when bg-modus turns bright — poor contrast.
  "accent-invert": "rounded bg-paper px-6 py-3.5 text-[14px] font-medium text-ink hover:bg-paper/90",
  // "hero-round" = the compact circular forward action inside the hero's
  // floating diagnostic shell (Checkpoint 5.5, third pass). The shell
  // itself is a forced-light surface in both themes, so this uses fixed
  // near-black/white rather than theme-relative tokens — it must stay
  // dark-on-light regardless of site theme, same reasoning as the shell.
  // Icon-only visually; the real label is still the accessible name (see
  // `aria-label` below), so nothing is lost for screen readers.
  "hero-round":
    "h-11 w-11 justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700",
};

const BASE = "inline-flex items-center gap-2 transition-colors duration-200 ease-modus";

/**
 * The one canonical Free Diagnostic CTA — every existing hardcoded
 * `href="/diagnostic"` link elsewhere in the codebase (Hero, FinalCTA,
 * PricingHero, PricingEstimateCTA, HomeContextBanner) is untouched by
 * this checkpoint since each has its own established personalization
 * wiring already; this component is for the *new* Checkpoint 3 shell
 * surfaces (Navigation, mobile nav, footer) so they don't each reinvent
 * the label/href logic. Every variant routes through the same
 * `useCustomerContext()` next-best-action system Navigation.tsx already
 * used — "Free Diagnostic" for a new visitor, "Continue Diagnostic" /
 * "View Proposal" / "View Profile" for a returning one — never a second,
 * competing CTA implementation.
 */
export function DiagnosticCTA({
  variant = "inline",
  magnetic = false,
  className = "",
  source,
  hint,
  icon,
}: {
  variant?: Variant;
  magnetic?: boolean;
  className?: string;
  /** Passed to `track("diagnostic_click", { source })` — matches the
   * established convention every other diagnostic CTA in the codebase
   * already follows (FinalCTA, PricingHero, PricingEstimateCTA). */
  source: string;
  /** Checkpoint 5, Section 13 — an optional, non-authoritative context hint
   * (e.g. the homepage diagnostic-entry's selected category chip),
   * appended as a `?hint=` query param purely for the Diagnostic intro
   * screen to acknowledge visually. Only applied for a genuinely new
   * visitor (`RUN_DIAGNOSTIC`) — a returning visitor's `nextBestAction`
   * href may point at an in-progress diagnostic, a profile, or an
   * external proposal URL, none of which a homepage category chip is
   * relevant to. Never read by the state machine itself. */
  hint?: string;
  /** Replaces the visible label with an icon (used by `hero-round`). The
   * label is still applied as `aria-label`, so the accessible name — and
   * therefore the personalised next-best-action wording — is unchanged. */
  icon?: React.ReactNode;
}) {
  const dict = useDict();
  const { nextBestAction } = useCustomerContext();
  const label =
    nextBestAction.id === "CONTINUE_DIAGNOSTIC"
      ? dict.customerContext.diagnosticInProgress.cta
      : nextBestAction.id === "VIEW_PROPOSAL"
        ? dict.customerContext.proposalReady.cta
        : nextBestAction.id === "VIEW_PROFILE"
          ? dict.customerContext.profileReady.cta
          : dict.nav.runDiagnostic;

  const href =
    hint && nextBestAction.id === "RUN_DIAGNOSTIC"
      ? `${nextBestAction.href}?hint=${encodeURIComponent(hint)}`
      : nextBestAction.href;

  const link = (
    <Link
      href={href}
      onClick={() => track("diagnostic_click", { source })}
      aria-label={icon ? label : undefined}
      className={`${BASE} ${VARIANT_CLASS[variant]} ${className}`}>
      {icon ?? label}
    </Link>
  );

  return magnetic ? <MagneticButton range={3}>{link}</MagneticButton> : link;
}
