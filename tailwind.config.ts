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
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Reserved for Checkpoint 4's homepage work — not used anywhere
        // yet. Fluid between a large-mobile floor and the brief's
        // "large editorial typography" ceiling.
        "display-xl": [
          "clamp(3.25rem, 2.1rem + 3.9vw, 6.25rem)",
          { lineHeight: "1.0", letterSpacing: "-0.02em" },
        ],
        // H1 72/80 -0.02em — same ceiling as before (4.5rem/72px), now
        // fluid below it instead of a fixed size cut off by breakpoints.
        // Existing usages get graceful in-between scaling for free; the
        // floor (2.75rem/44px) is comfortably above what these headings
        // already rendered at on a 390px Playwright check.
        "display-lg": [
          "clamp(2.75rem, 2.05rem + 2.7vw, 4.5rem)",
          { lineHeight: "1.08", letterSpacing: "-0.02em" },
        ],
        // H2 48/56 -0.01em
        "display-md": [
          "clamp(2rem, 1.6rem + 1.6vw, 3rem)",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],
        // H3 32/40 0em
        "display-sm": [
          "clamp(1.5rem, 1.3rem + 0.8vw, 2rem)",
          { lineHeight: "1.25", letterSpacing: "0em" },
        ],
      },
      spacing: {
        // Reserved editorial section-rhythm tokens for Checkpoints 3+ —
        // not consumed by any existing component yet. Existing sections
        // keep their current ad hoc py-* values until each is actually
        // redesigned; these exist so that redesign work has a shared
        // scale to reach for instead of inventing new numbers per page.
        gutter: "1.5rem",
        "section-sm": "5rem",
        section: "7rem",
        "section-lg": "9rem",
        "section-xl": "11rem",
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      maxWidth: {
        content: "1280px",
      },
      transitionTimingFunction: {
        modus: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
