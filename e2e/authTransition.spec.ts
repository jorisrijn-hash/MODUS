import { test, expect, type Page } from "@playwright/test";

/**
 * The transition between the two auth screens.
 *
 * The brief asks for a morph, not a page fade: the mark, the heading
 * block and the form surface should transition in place. "Looks animated"
 * is not testable, but the thing that makes it a morph rather than a
 * crossfade is — the shared elements must be the SAME DOM nodes before
 * and after, never unmounted and recreated.
 */

const SHOTS = "e2e-screens";

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.locator(".cl-formButtonPrimary, form").first().waitFor({ timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(700);
}

/** Tags a node so we can tell afterwards whether it survived. */
async function tag(page: Page, selector: string, value: string) {
  await page.locator(selector).first().evaluate((el, v) => ((el as HTMLElement & { __tag?: string }).__tag = v), value);
}
async function stillTagged(page: Page, selector: string, value: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el, v) => (el as HTMLElement & { __tag?: string }).__tag === v, value);
}

test.describe("sign-in and sign-up share one shell", () => {
  test("the mark survives the navigation instead of being re-created", async ({ page }) => {
    await page.goto("/sign-in");
    await settle(page);
    await tag(page, '[aria-label="MODUS home"]', "shared-mark");

    await page.getByRole("link", { name: /Create an account/i }).click();
    await expect(page).toHaveURL(/\/sign-up/);
    await settle(page);

    // The same node, still carrying the tag: it was never unmounted, so
    // it can transition in place rather than fade out and back in.
    expect(await stillTagged(page, '[aria-label="MODUS home"]', "shared-mark")).toBe(true);
  });

  test("the copy actually changes with the route", async ({ page }) => {
    await page.goto("/sign-in");
    await settle(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Sign in to MODUS/i);

    await page.getByRole("link", { name: /Create an account/i }).click();
    await settle(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Create your MODUS account/i);
    await expect(page.getByText(/Save your progress and return with a clearer picture/i)).toBeVisible();
  });

  test("real URLs and working browser Back", async ({ page }) => {
    await page.goto("/sign-in");
    await settle(page);
    await page.getByRole("link", { name: /Create an account/i }).click();
    await expect(page).toHaveURL(/\/sign-up$/);
    await settle(page);

    await page.goBack();
    await expect(page).toHaveURL(/\/sign-in$/);
    await settle(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Sign in to MODUS/i);
    // Clerk's own form is still functional after the morph, not a husk.
    await expect(page.locator(".cl-formButtonPrimary").first()).toBeVisible();
  });

  test("the form stays readable and operable throughout", async ({ page }) => {
    await page.goto("/sign-up");
    await settle(page);
    const primary = page.locator(".cl-formButtonPrimary").first();
    const paint = await primary.evaluate((el) => {
      const c = getComputedStyle(el);
      return { bg: c.backgroundColor, color: c.color, opacity: c.opacity, visibility: c.visibility };
    });
    expect(paint.bg).toBe("rgb(30, 59, 46)");
    expect(paint.color).toBe("rgb(255, 255, 255)");
    expect(paint.visibility).toBe("visible");
    expect(Number(paint.opacity)).toBeGreaterThan(0.9);
  });

  test("keyboard focus reaches the link and shows a visible ring", async ({ page }) => {
    await page.goto("/sign-in");
    await settle(page);
    const link = page.getByRole("link", { name: /Create an account/i });
    await link.focus();
    const outline = await link.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: s.outlineWidth, shadow: s.boxShadow };
    });
    const visible = (outline.style !== "none" && outline.width !== "0px") || outline.shadow !== "none";
    expect(visible, `no focus ring: ${JSON.stringify(outline)}`).toBe(true);

    // Activating by keyboard navigates for real.
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("reduced motion still arrives at the same screen", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/sign-in");
    await settle(page);
    await page.getByRole("link", { name: /Create an account/i }).click();
    await expect(page).toHaveURL(/\/sign-up/);
    // No waiting on an animation: the destination is correct immediately.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Create your MODUS account/i);
    await expect(page.locator(".cl-formButtonPrimary").first()).toBeVisible();
  });
});

for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  test(`captures at ${name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const route of ["sign-in", "sign-up"] as const) {
      await page.goto(`/${route}`);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/auth-${route}-${name}.png` });
    }
  });
}
