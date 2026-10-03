/**
 * MODUS styling for Clerk's own rendered subtree.
 *
 * Clerk renders inside its own markup, so the card cannot be reached with
 * ordinary CSS from this app — `appearance` is the supported seam.
 *
 * Values are the MODUS tokens, written as literals because this object is
 * handed to a third-party renderer that cannot read our CSS custom
 * properties: ground #D7D7D0, cream surface #F4F4E7, ink #1A1614, MODUS
 * green #1E3B2E, line #BDBDB5. If the tokens in `globals.css` change,
 * these must change with them — there is no way to make that automatic
 * across the boundary.
 */
// Not annotated with Clerk's `Appearance` type: `@clerk/types` is not a
// dependency of this project, and adding a package purely to name a type
// is not worth it. The literal unions below are pinned with `as const` so
// this still type-checks where it is passed.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#1E3B2E",
    colorText: "#1A1614",
    colorTextSecondary: "#3C3834",
    colorBackground: "#F4F4E7",
    colorInputBackground: "#F4F4E7",
    colorInputText: "#1A1614",
    colorDanger: "#8C2F24",
    colorSuccess: "#1E3B2E",
    colorNeutral: "#585751",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    fontSize: "14.5px",
  },
  /*
   * Structural only. Visual styling lives in `globals.css` against
   * Clerk's `cl-` classes — Tailwind does not reliably emit utilities
   * that appear only in this file, which silently dropped the primary
   * button's background. `hidden` is kept because it is used throughout
   * the project and is therefore always generated.
   */
  elements: {
    rootBox: "w-full",
    header: "hidden",
    logoBox: "hidden",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
    showOptionalFields: false,
    // The page carries these as real links instead, so they are reachable
    // and styled rather than rendered in Clerk's own small print.
    helpPageUrl: "/legal",
    privacyPageUrl: "/privacypolicy",
  },
};
