/**
 * MODUS Pricing Model V1 — the commercial source of truth.
 *
 * October owner revision: public anchors are approximately €200 / €700 /
 * €1,000 monthly. The limited, low-complexity band now starts at €200.
 * Higher complexity bands and scope adjustments are retained: anchors
 * are guidance, not caps or promises of unlimited implementation.
 * Existing persisted estimates retain their original amounts and version.
 */
export const PRICING_CONFIG = {
  currency: "EUR",
  diagnostic: { price: 0 },
  monthly: {
    minimum: 200,
    bands: [
      { id: "focused", scoreMin: 0, scoreMax: 4, estimateMin: 200, estimateMax: 350 },
      { id: "developing", scoreMin: 5, scoreMax: 8, estimateMin: 650, estimateMax: 900 },
      { id: "moderate", scoreMin: 9, scoreMax: 12, estimateMin: 900, estimateMax: 1250 },
      { id: "advanced", scoreMin: 13, scoreMax: 16, estimateMin: 1250, estimateMax: 1650 },
      { id: "extensive", scoreMin: 17, scoreMax: 19, estimateMin: 1650, estimateMax: 2000 },
      { id: "complex", scoreMin: 20, scoreMax: 22, manualScope: true, startingAt: 2000 },
    ] as const,
  },
  implementation: {
    light: { adjustmentMin: 0, adjustmentMax: 0 },
    standard: { adjustmentMin: 150, adjustmentMax: 350 },
    substantial: { manualScope: true },
  },
  initialImplementation: {
    supported: true,
    indicativeMin: 500,
    indicativeMax: 2500,
    displayPublicly: false,
  },
  estimate: { roundingIncrement: 50, version: "2026.10" },
} as const;

export type PricingBandId = (typeof PRICING_CONFIG.monthly.bands)[number]["id"];
export type ImplementationScope = "light" | "standard" | "substantial";
