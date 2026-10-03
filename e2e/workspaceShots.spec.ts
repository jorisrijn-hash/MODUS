import { test, expect, type Page } from "@playwright/test";
import { signInAs, testAccounts } from "./clerkBrowserSession";

/**
 * Screenshots of the real application: real database records, a real
 * Clerk admin session, no fixtures and no mocked responses.
 *
 * The bundle's admin screenshots were explicitly fixture-based. These are
 * the evidence that the workspace renders against actual data.
 */
const env = testAccounts();
const SHOTS = "e2e-screens";

async function settle(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1200);
}

async function dismissConsent(page: Page) {
  const accept = page.getByRole("button", { name: /Accept All/i });
  if (await accept.isVisible().catch(() => false)) await accept.click();
}

for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  test(`workspace on real data at ${name}`, async ({ page }) => {
    test.skip(!env, "run scripts/create-test-users.mjs first");
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await signInAs(page, env!.MODUS_TEST_A_EMAIL);

    for (const [path, label] of [
      ["/private", "overview"],
      ["/private/pipeline", "pipeline"],
      ["/private/diagnostics", "inbox"],
    ] as const) {
      await page.goto(path);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/os-${label}-${name}.png`, fullPage: name === "mobile" });
    }

    // A real record's detail screen.
    await page.goto("/private/diagnostics");
    await settle(page);
    const first = page.locator("tbody tr a").first();
    await expect(first).toBeVisible({ timeout: 25_000 });
    await first.click();
    await settle(page);
    await page.screenshot({ path: `${SHOTS}/os-detail-${name}.png`, fullPage: name === "mobile" });
  });

  test(`platform demo and pricing at ${name}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    await page.goto("/platform");
    await settle(page);
    await dismissConsent(page);
    const demo = page.getByTestId("platform-demo");
    await demo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await demo.screenshot({ path: `${SHOTS}/os-demo-${name}.png` });

    await page.goto("/pricing");
    await settle(page);
    await dismissConsent(page);
    const pricing = page.getByTestId("plan-comparison");
    await pricing.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await pricing.screenshot({ path: `${SHOTS}/os-pricing-${name}.png` });
  });
}
