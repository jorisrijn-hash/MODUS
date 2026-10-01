import type { Config } from "tailwindcss";

// Color/type values sourced from MODUS Brand Style Guide v1.0.
// Token names kept from the original build for lower churn; hex values are
// exact guide matches: ink=Graphite, graphite=Stone, muted=Ash, paper=Paper,
// mineral=Mineral, modus=Modus Green, signal=Signal Red.
//
// As of the Master Redesign V2 Checkpoint 1, every color below resolves to
// a CSS custom property (defined in globals.css's `@layer base`) rather
// than a flat hex — that's the actual light/dark theme source of truth.
// These brand names are kept as the primary authoring vocabulary
// deliberately, so the ~150+ existing call sites using `bg-paper`,
// `text-ink`, `border-line`, etc. become theme-aware for free with zero
// refactor. New semantic names the brief's token architecture calls for
// but that don't already have a brand-name equivalent (`surface-elevated`,
// `line-strong`, `accent-foreground`, `accent-soft`, `danger`,
// `danger-foreground`) are added alongside. See
// MODUS_REDESIGN_REPORT.md's Checkpoint 1 entry for the full mapping and
// the WCAG contrast numbers behind every dark-mode value.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x) / <alpha-value>) — not a plain var(--x) hex
        // reference — is required for Tailwind's `/NN` opacity modifier
        // (bg-ink/40, bg-signal/8, ...) to keep working now that these
        // resolve through CSS custom properties instead of flat hex.
        // <alpha-value> is a literal Tailwind placeholder token, not a
        // variable — it gets replaced with the modifier or 1. Confirmed
        // by inspecting compiled output; a plain var(--x) reference
        // silently drops every opacity modifier at build time instead of
        // erroring, so this isn't optional. See globals.css's token block.
        paper: "rgb(var(--canvas) / <alpha-value>)",
        mineral: "rgb(var(--canvas-secondary) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-elevated": "rgb(var(--surface-elevated) / <alpha-value>)",
        ink: "rgb(var(--text-primary) / <alpha-value>)",
        graphite: "rgb(var(--text-secondary) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        // Fixed regardless of site theme — see globals.css's token block
        // for why this exists (bg-ink/text-paper silently inverted under
        // a dark site theme once those became theme-relative).
        inverted: {
          DEFAULT: "rgb(var(--surface-inverted) / <alpha-value>)",
          foreground: "rgb(var(--surface-inverted-foreground) / <alpha-value>)",
        },
        modus: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          light: "rgb(var(--accent-light) / <alpha-value>)",
          dim: "rgb(var(--accent-dim) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
          soft: "var(--accent-soft)",
        },
        signal: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          foreground: "rgb(var(--danger-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        // Display. No Signifier licence is supplied anywhere in this
        // repository, and the reference's own public font file is a trial
        // asset whose availability grants no redistribution right — so
        // this is the mandate's explicit fallback, Noto Serif, and is
        // labelled as a fallback rather than passed off as Signifier.
        serif: ["var(--font-serif)", "Noto Serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Scales below are the measured reference values, expressed
        // through the Osmo `--sf` unit so they scale with the design
        // width instead of jumping at breakpoints. At 1440px, `--sf` is
        // exactly 1px, so `calc(54 * var(--sf))` renders at precisely the
        // researched 54px. Mobile values are recomposed, not just scaled.
        //
        // Hero: desktop 54/59.4, mobile 40/44. The MODUS draft hero sits
        // at 58/66; the research value is the fidelity reference, so this
        // takes the researched size and keeps the draft's deliberate
        // two-line break via explicit markup rather than font size.
        "display-hero": [
          "max(40px, calc(54 * var(--sf)))",
          { lineHeight: "1.1", letterSpacing: "-0.015em" },
        ],
        // Section heading 48/52.8.
        "display-section": [
          "max(32px, calc(48 * var(--sf)))",
          { lineHeight: "1.1", letterSpacing: "-0.01em" },
        ],
        // Subheading 34/42.
        "display-sub": [
          "max(24px, calc(34 * var(--sf)))",
          { lineHeight: "1.24", letterSpacing: "-0.005em" },
        ],
        // Lead 24/28.8 desktop, 20/24 mobile.
        lead: [
          "max(18px, calc(24 * var(--sf)))",
          { lineHeight: "1.2", letterSpacing: "0em" },
        ],
        // Technical label 14/21, used with wide tracking in mono.
        label: [
          "max(11px, calc(13 * var(--sf)))",
          { lineHeight: "1.5", letterSpacing: "0.1em" },
        ],

        // --- Retained for not-yet-migrated routes -----------------------
        // Still referenced by pages this rebuild has not reached yet.
        // Removing them now would break those routes before their
        // replacement exists; the mandate requires migrating consumers
        // first. Tracked in MODUS_VISUAL_RESET_AUDIT.md.
        "display-xl": [
          "clamp(3.25rem, 2.1rem + 3.9vw, 6.25rem)",
          { lineHeight: "1.0", letterSpacing: "-0.02em" },
        ],
        "display-lg": [
          "clamp(2.75rem, 2.05rem + 2.7vw, 4.5rem)",
          { lineHeight: "1.08", letterSpacing: "-0.02em" },
        ],
        "display-md": [
          "clamp(2rem, 1.6rem + 1.6vw, 3rem)",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],
        "display-sm": [
          "clamp(1.5rem, 1.3rem + 0.8vw, 2rem)",
          { lineHeight: "1.25", letterSpacing: "0em" },
        ],
      },
      spacing: {
        gutter: "var(--gutter-mobile)",
        "gutter-lg": "var(--gutter-desktop)",
        // Story-column geometry from the measured reference, in `--sf`
        // units so it tracks the design width.
        story: "calc(460 * var(--sf))",
        "scene-gap": "calc(64 * var(--sf))",
        "section-sm": "5rem",
        section: "7rem",
        "section-lg": "9rem",
        "section-xl": "11rem",
      },
      borderRadius: {
        // Deliberately UNCHANGED from the pre-rebuild values. The
        // reference's technical cards are square and its CTAs are pills,
        // but `rounded` (DEFAULT) is used by ~every button and panel in
        // /app and /private, which this rebuild has not migrated yet.
        // Zeroing it here would square those surfaces off before their
        // replacement exists — the unscoped cascade edit the mandate
        // warns against. New marketing components state `rounded-none`
        // or `rounded-full` explicitly instead. Revisit at Checkpoint G
        // once the product shells are migrated.
        none: "0px",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      maxWidth: {
        content: "1280px",
        site: "var(--site-container)",
        // Hero text 738px, lead 600px — measured.
        "hero-text": "calc(738 * var(--sf))",
        "hero-lead": "calc(600 * var(--sf))",
      },
      transitionTimingFunction: {
        modus: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
