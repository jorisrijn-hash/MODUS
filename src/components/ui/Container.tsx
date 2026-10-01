import { type ReactNode } from "react";

/**
 * Standard section container. Wide (site now uses the full viewport more
 * confidently) — nest a narrow `max-w-*` wrapper inside for headline/copy
 * blocks that need a readable line length; let diagrams, platform previews
 * and data layouts fill the rest.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1760px] px-6 sm:px-8 md:px-10 lg:px-12 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Near-edge-to-edge wrapper for chrome that should feel wider than page
 * content — navigation and footer. Effectively fluid; caps only on very
 * large screens so it never looks absurd on an ultrawide monitor.
 */
export function WideBleed({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[2000px] px-4 sm:px-6 md:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
