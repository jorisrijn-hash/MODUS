import { test, expect } from "@playwright/test";

/*
 * The first-load intro curtain was removed at the user's request. These
 * tests previously asserted that it appeared and then cleared itself.
 *
 * Rather than deleting the file, they are inverted into a regression
 * guard: nothing should cover the page on load, in either motion mode.
 * That keeps a cheap check that the curtain does not quietly come back,
 * and it would also catch any other full-viewport overlay appearing at
 * that z-index.
 */

test("no intro curtain covers the page on load", async ({ page }) => {
  await page.goto("/");
  // Well past the old curtain's full 2.3s timeline, so a reappearing
  // overlay would be caught rather than missed by checking too early.
  await page.waitForTimeout(600);
  await expect(page.locator(".z-\\[100\\]")).toHaveCount(0);
  await page.waitForTimeout(2000);
  await expect(page.locator(".z-\\[100\\]")).toHaveCount(0);
});

test("no intro curtain under reduced motion either", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  await expect(page.locator(".z-\\[100\\]")).toHaveCount(0);
});

test("the hero headline is visible immediately, not behind an overlay", async ({ page }) => {
  await page.goto("/");
  // The real point of removing the curtain: the hero is readable at once.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 5000 });
});
