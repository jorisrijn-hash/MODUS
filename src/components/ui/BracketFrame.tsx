import { type ReactNode } from "react";

/**
 * The unfilled-card treatment from `assets/stack-corner-reference.png`.
 *
 * Looking at the supplied image rather than the source dimensions: the
 * unfilled card combines a *faint* dashed rectangular border with four
 * noticeably *sharper* solid L-shaped corner marks, a page-coloured fill,
 * square corners and generous interior padding. The dashed border alone is
 * not the effect — the contrast between the quiet dash and the solid
 * corners is what makes it read as a technical frame.
 *
 * The filled (active) card in that same image is clean: solid fill, light
 * text, and no competing corner marks. So `tone="active"` deliberately
 * renders no brackets.
 *
 * Geometry: the reference's own corner component uses a 10×10 SVG box with
 * a 1.5px `currentColor` stroke, butt caps and miter joins. The SVG box
 * size is not the visible arm length — the arms are drawn to the box edge,
 * so the visible L is ~10px per arm. Corners are `pointer-events-none` and
 * `aria-hidden`: they are decoration, and nothing about them should reach
 * the accessibility tree or intercept input.
 */

function Corner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      width="10"
      height="10"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute ${className}`}
    >
      <path
        d="M0 10 L0 0 L10 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function BracketFrame({
  children,
  tone = "inactive",
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  /**
   * `inactive` — page ground, ink text, quiet dashed border, solid corners.
   * `active`   — solid deep MODUS green, light text, no corner marks.
   */
  tone?: "inactive" | "active";
  as?: "div" | "article" | "li";
  className?: string;
}) {
  const active = tone === "active";

  return (
    <Tag
      className={[
        "relative rounded-none",
        // Padding is identical in both tones on purpose. Activating a card
        // must not reflow it — the reference transitions colour only, and
        // a padding change here would shift every sibling in the sticky
        // story column mid-scroll.
        "p-7 md:p-8",
        active
          ? "border border-modus bg-modus text-[rgb(var(--surface-inverted-foreground))]"
          : "border border-dashed border-line-strong/45 bg-transparent text-ink",
        "transition-colors duration-500 ease-modus",
        className,
      ].join(" ")}
    >
      {/* Corner marks sit at the border corners, offset by half the stroke
          so the solid L reads as aligned with the dashed rule rather than
          floating inside it. Suppressed entirely on the active card. */}
      {!active && (
        <span className="text-ink" aria-hidden="true">
          <Corner className="-left-px -top-px" />
          <Corner className="-right-px -top-px rotate-90" />
          <Corner className="-bottom-px -right-px rotate-180" />
          <Corner className="-bottom-px -left-px -rotate-90" />
        </span>
      )}
      {children}
    </Tag>
  );
}
