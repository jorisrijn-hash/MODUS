import { test, expect } from "@playwright/test";

test("loader is skipped entirely under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  const loader = page.locator(".z-\\[100\\]");
  await expect(loader).toHaveCount(0);
});

test("loader shows then clears itself under normal motion", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(400);
  await expect(page.locator(".z-\\[100\\]")).toHaveCount(1);
  await page.waitForTimeout(2200);
  await expect(page.locator(".z-\\[100\\]")).toHaveCount(0);
});
