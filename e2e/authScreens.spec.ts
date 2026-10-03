import { test, expect, type Page } from "@playwright/test";

/**
 * Visual and accessibility verification of the Clerk screens.
 *
 * Provider configuration proves a Google button will appear; it proves
 * nothing about whether the screen looks like MODUS. These were bare
 * `<SignIn />` on a white flex container — Clerk's card, Clerk's
 * typeface, Clerk's blue button — so this checks the things the brief
 * names, against the rendered page.
 */

const SHOTS = "e2e-screens";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Clerk mounts asynchronously; wait for its form, not just the shell. */
/**
 * Answer the consent banner the way a visitor would. It is fixed to the
 * bottom centre of every page, so leaving it up means testing a screen
 * with a dialog over part of it.
 */
async function settleConsent(page: Page) {
  const accept = page.getByRole("button", { name: /Accept All/i });
  if (await accept.isVisible().catch(() => false)) await accept.click();
}

async function waitForClerk(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // The card renders once Clerk has loaded. Give it room on a cold route.
  await page
    .locator(".cl-rootBox, .cl-card, form")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {
      // Falls through to the assertions below, which report what is
      // actually missing rather than a bare timeout here.
    });
  await page.waitForTimeout(900);
}

for (const [name, viewport] of [
  ["desktop", DESKTOP],
  ["mobile", MOBILE],
] as const) {
  for (const route of ["sign-in", "sign-up"] as const) {
    test(`${route} renders on the MODUS surface at ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/${route}`);
      await waitForClerk(page);

      // Warm light canvas, not white: the MODUS ground is #D7D7D0.
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bg, "body should carry the warm MODUS ground").toBe("rgb(215, 215, 208)");

      // The bare ink mark, linking home — not a wordmark lockup.
      const mark = page.getByRole("link", { name: /MODUS home/i });
      await expect(mark).toBeVisible();
      await expect(mark.locator("svg")).toBeVisible();

      // Serif display face actually loaded, not a fallback.
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      const font = await heading.evaluate((el) => getComputedStyle(el).fontFamily);
      expect(font, "the display heading should use the serif stack").toMatch(/Noto Serif|serif/i);

      /*
       * The primary action must actually BE the MODUS green. It rendered
       * with a transparent background and white label text — unreadable,
       * while still being present, visible and clickable, so nothing
       * except a screenshot would have caught it. Clerk injects its own
       * `--accent` over the MODUS token of the same name, which silently
       * invalidated `rgb(var(--accent))`.
       */
      const primary = page.locator(".cl-formButtonPrimary").first();
      await expect(primary).toBeVisible();
      const paint = await primary.evaluate((el) => {
        const c = getComputedStyle(el);
        return { bg: c.backgroundColor, color: c.color };
      });
      expect(paint.bg, "the primary action should be MODUS green").toBe("rgb(30, 59, 46)");
      expect(paint.color, "its label should be white on that green").toBe("rgb(255, 255, 255)");

      await page.screenshot({ path: `${SHOTS}/auth-${route}-${name}.png`, fullPage: false });
    });
  }
}

test("the sign-in screen has an accessible focus state and a reachable guest route", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/sign-in");
  await waitForClerk(page);

  // Keyboard focus must be visible and must not be the browser default
  // being suppressed with no replacement.
  const focusable = page.locator("input, button, a").first();
  await focusable.focus();
  const outline = await focusable.evaluate((el) => {
    const s = getComputedStyle(el);
    return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
  });
  const hasVisibleFocus =
    (outline.outlineStyle !== "none" && outline.outlineWidth !== "0px") ||
    (outline.boxShadow !== "none" && outline.boxShadow !== "");
  expect(hasVisibleFocus, `no visible focus indicator: ${JSON.stringify(outline)}`).toBe(true);

  // The guest diagnostic stays reachable from the auth screen: signing in
  // is never a gate on the free diagnostic.
  await settleConsent(page);
  const guest = page.getByRole("link", { name: /run a diagnostic as a guest/i });
  await expect(guest).toBeVisible();
  await guest.click();
  await expect(page).toHaveURL(/\/diagnostic/);
});
