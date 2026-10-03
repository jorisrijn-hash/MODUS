import { describe, expect, it } from "vitest";
import { MONTHLY_PLANS, PLAN_COPY } from "./plans";
import { PRICING_CONFIG } from "./config";

describe("owner-requested pricing", () => {
  it("offers the three monthly anchors and OS only in Core and Partner", () => {
    expect(MONTHLY_PLANS.map((p) => p.monthly)).toEqual([200, 700, 1000]);
    expect(MONTHLY_PLANS.filter((p) => p.os).map((p) => p.id)).toEqual([
      "core",
      "partner",
    ]);
    expect(MONTHLY_PLANS.filter((p) => p.bestValue).map((p) => p.id)).toEqual([
      "core",
    ]);
    expect(PRICING_CONFIG.monthly.minimum).toBe(200);
    expect(PRICING_CONFIG.estimate.version).toBe("2026.10");
  });
  it("keeps localized comparison rows aligned to three tiers", () => {
    for (const copy of Object.values(PLAN_COPY)) {
      expect(copy.features).toHaveLength(3);
      for (const row of copy.rows) expect(row.values).toHaveLength(3);
    }
  });
});
