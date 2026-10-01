import { type ReactNode } from "react";

/**
 * Restrained media container — Checkpoint 3, Section 16. A thin border,
 * square-to-small radius, no shadow/glassmorphism, matching the existing
 * brand restraint (see tailwind.config.ts's own comment on the radius
 * scale) rather than a generic SaaS "card with a big shadow" treatment.
 * A `label` renders as a small mono caption in the corner — the same
 * technical-label language `SectionLabel` uses elsewhere — for media
 * that benefits from a system-style annotation (a diagram, a screenshot),
 * omitted entirely when not passed.
 */
export function MediaFrame({
  children,
  label,
  aspect,
  className = "",
}: {
  children: ReactNode;
  label?: string;
  aspect?: "video" | "square" | "portrait";
  className?: string;
}) {
  const aspectClass = aspect === "video" ? "aspect-video" : aspect === "square" ? "aspect-square" : aspect === "portrait" ? "aspect-[3/4]" : "";

  return (
    // w-full is load-bearing, not decorative: `aspect-*` needs a
    // width-constrained box to derive height *from* width. Without it, a
    // box that also receives an explicit height from elsewhere (as
    // CasesPreview's `h-full` did) lets the browser compute width from
    // `aspect-ratio × height` instead, freely, ignoring the parent's
    // actual available space — a real overflow bug found live via the
    // project's own responsive regression suite (522px content at a
    // 390px viewport), not caught by inspection alone.
    <div className={`relative w-full overflow-hidden rounded-md border border-line bg-mineral ${aspectClass} ${className}`}>
      {children}
      {label && (
        <span className="absolute bottom-3 left-3 rounded-sm bg-paper/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
          {label}
        </span>
      )}
    </div>
  );
}
