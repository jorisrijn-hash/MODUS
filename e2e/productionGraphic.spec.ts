import { test, expect } from "@playwright/test";

/**
 * The diagnostic graphic on the deployed site, WITHOUT submitting.
 *
 * `diagnosticScene.spec.ts` walks the whole journey and submits, which
 * against production would create records nobody authorised. This checks
 * the same visual claims up to the point of submission and stops there:
 * the entry sphere, the answer-driven layers, the annotations, and the
 * absence of the old node-map card.
 *
 * Run with MODUS_E2E_BASE_URL to point it at a deployment.
 */
test.describe("diagnostic graphic on the deployment", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.setTimeout(120_000);

  test("one composition: entry sphere, then answer-driven layers", async ({ page }) => {
    await page.goto("/diagnostic");
    await page.waitForLoadState("domcontentloaded");

    // Entry: exactly one canvas, and no topic names yet — naming them
    // here would imply progress that has not happened.
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 20_000 });
    await expect
      .poll(() => page.locator('[data-layer="0"]').evaluate((el) => (el as HTMLElement).style.opacity || "0"), { timeout: 10_000 })
      .toBe("0");

    // The old node-map card must be gone, not relocated.
    await expect(page.getByText(/INITIAL PROFILE/i)).toHaveCount(0);
    for (const pill of ["OPERATIONS", "AUTOMATION", "REVENUE", "DATA"]) {
      await expect(page.getByText(pill, { exact: true })).toHaveCount(0);
    }

    await page.getByRole("button", { name: /Start|Begin/i }).first().click();
    await expect(page.getByText("01 / 06")).toBeVisible();

    // Still exactly one canvas — one composition, not a scene plus a card.
    await expect(page.locator("canvas")).toHaveCount(1);
    // The first topic reads as active; a later one is present but quiet.
    await expect
      .poll(() => page.locator('[data-layer="0"]').evaluate((el) => Number((el as HTMLElement).style.opacity || 0)), { timeout: 15_000 })
      .toBe(1);
    expect(
      await page.locator('[data-layer="3"]').evaluate((el) => Number((el as HTMLElement).style.opacity || 0))
    ).toBeLessThan(1);

    // The readout carries the real profile's empty state rather than
    // placeholder data.
    await expect(page.getByText(/Your profile will build here as you answer/i)).toBeVisible();

    await page.screenshot({ path: "e2e-screens/production-graphic.png" });
  });

  test("no WebGL below the desktop threshold", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto("/diagnostic");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2500);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
