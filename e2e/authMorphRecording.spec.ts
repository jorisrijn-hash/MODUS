import { test, expect, type Page } from "@playwright/test";

/**
 * A recording of the sign-in ↔ sign-up morph.
 *
 * Stills do not show a transition. The mid-flight screenshots in
 * `authTransition.spec.ts` mostly land after the ~420ms swap has
 * finished, because screenshot latency exceeds the animation — so they
 * show the destination, not the morph. This records it instead: the mark
 * holds still while the copy exchanges and the card resizes to the new
 * form.
 *
 * Playwright writes the video under `test-results/`; the path is printed
 * at the end of the run.
 */
test.use({ video: { mode: "on", size: { width: 1280, height: 800 } } });

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.locator(".cl-formButtonPrimary, form").first().waitFor({ timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(700);
}

test("records sign-in to sign-up and back", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/sign-in");
  await settle(page);

  const accept = page.getByRole("button", { name: /Accept All/i });
  if (await accept.isVisible().catch(() => false)) await accept.click();
  await page.waitForTimeout(600);

  await page.locator('p a[href="/sign-up"]').first().click();
  /*
   * Named, not `level: 1`. During the swap BOTH headings are in the DOM
   * at once — `AnimatePresence` holds the outgoing copy while the
   * incoming one arrives — which is itself evidence the exchange happens
   * in place rather than as a page replacement, but it makes a generic
   * h1 locator ambiguous.
   */
  await expect(page.getByRole("heading", { name: /Create your MODUS account/i })).toBeVisible();
  await page.waitForTimeout(1400);

  // The shell's own footer link, not Clerk's card footer — both read
  // "Sign in", but only one is the route change this records.
  await page.locator('p a[href="/sign-in"]').first().click();
  await expect(page.getByRole("heading", { name: /Sign in to MODUS/i })).toBeVisible();
  await page.waitForTimeout(1400);

  console.log("MORPH VIDEO:", await page.video()?.path());
});
