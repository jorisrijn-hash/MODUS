import { type ReactNode } from "react";
import { Container, WideBleed } from "@/components/ui/Container";

const SURFACE_CLASS = {
  canvas: "bg-paper",
  secondary: "bg-mineral",
  inverted: "bg-inverted text-inverted-foreground",
} as const;

/**
 * Shared vertical-rhythm + surface wrapper for marketing page sections —
 * Checkpoint 3, Section 16. Not yet adopted by any real page (that's
 * Checkpoint 4+ content work); exists so that work has a consistent
 * primitive to reach for instead of each section inventing its own
 * `py-*` number. Uses the reserved spacing tokens from Checkpoint 1
 * (`section-sm`/`section`/`section-lg`), consumed here for the first
 * time. `bleed` picks `Container` (default, max-w-[1760px]) vs
 * `WideBleed` (max-w-[2000px], matching nav/footer) for content that
 * should run wider than the normal reading measure.
 */
export function MarketingSection({
  children,
  surface = "canvas",
  spacing = "section",
  bleed = false,
  className = "",
}: {
  children: ReactNode;
  surface?: keyof typeof SURFACE_CLASS;
  spacing?: "section-sm" | "section" | "section-lg";
  bleed?: boolean;
  className?: string;
}) {
  const Wrapper = bleed ? WideBleed : Container;
  const spacingClass = {
    "section-sm": "py-section-sm",
    section: "py-section",
    "section-lg": "py-section-lg",
  }[spacing];

  return (
    <section className={`${SURFACE_CLASS[surface]} ${className}`}>
      <Wrapper className={spacingClass}>{children}</Wrapper>
    </section>
  );
}
