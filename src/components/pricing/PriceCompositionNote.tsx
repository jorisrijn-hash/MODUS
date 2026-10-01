"use client";

import { useDict } from "@/lib/i18n/context";

/**
 * Sits directly beside every price figure on the site (generic tiers,
 * personalized estimate, diagnostic result) — one shared sentence about
 * what the number is made of, deliberately not a deliverables list (see
 * dict.pricing.compositionNote for why).
 */
export function PriceCompositionNote({ className = "" }: { className?: string }) {
  const dict = useDict();
  return (
    <p className={`max-w-lg text-[13.5px] leading-relaxed text-graphite ${className}`}>
      {dict.pricing.compositionNote}
    </p>
  );
}
