"use client";

import { type ReactNode } from "react";
import { LenisProvider } from "@/lib/motion/LenisProvider";

/**
 * Mounts LenisProvider scoped to just this one page — demonstrates the
 * Section 4 requirement ("not mounted globally yet, structurally suitable
 * for future (marketing) scoping") concretely rather than only in prose.
 * Checkpoint 3 will decide the real mounting point (a `(marketing)` route
 * group layout); this is that same pattern in miniature, proven here.
 */
export function MotionLabScrollProvider({ children }: { children: ReactNode }) {
  return <LenisProvider>{children}</LenisProvider>;
}
