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
      // Measured reference geometry: 1512px maximum, 120px desktop
      // gutters, 24px mobile. The intermediate steps are interpolation
      // between those two measured ends, not invented breakpoints —
      // mobile holds 24px to the `sm` boundary, then ramps to the full
      // 120px once there is room for it at `xl`.
      className={`mx-auto w-full max-w-site px-6 sm:px-10 md:px-14 lg:px-20 xl:px-[120px] ${className}`}
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
