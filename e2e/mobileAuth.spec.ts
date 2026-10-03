import { test, expect, type Page } from "@playwright/test";
import { signInAs, signOut, currentUserId, testAccounts } from "./clerkBrowserSession";

/**
 * Mobile account entry, in a real browser with a real Clerk session.
 *
 * The mobile menu imported the legacy demo `ClientUserButton` while
 * desktop used real Clerk. The handoff replaced it and unit-tested the
 * rendering, but a unit test cannot show that a real signed-in session
 * reaches the mobile menu, that signing out clears it, or that switching
 * accounts does not leak the previous one.
 */

const env = testAccounts();
const MOBILE = { width: 390, height: 844 };

/**
 * Scoped to the menu dialog itself. A bare `getByRole("dialog")` now
 * matches three things on the homepage — the menu, the consent banner and
 * the OS demo's navigation region — so the helper has to name the one it
 * means.
 */
function menu(page: Page) {
  return page.getByRole("dialog", { name: /Open menu/i });
}

async function openMenu(page: Page) {
  await page.getByRole("button", { name: /menu/i }).first().click();
  await expect(menu(page)).toBeVisible();
}

test.describe("mobile account entry", () => {
  test.use({ viewport: MOBILE });
  test.setTimeout(120_000);

  test("offers the canonical Clerk routes, not the demo control", async ({ page }) => {
    await page.goto("/");
    await openMenu(page);

    // The real shared morph shell, not /app/login and not a demo button.
    const signIn = menu(page).getByRole("link", { name: /^Sign in$/i });
    const signUp = menu(page).getByRole("link", { name: /Create account/i });
    await expect(signIn).toHaveAttribute("href", "/sign-in");
    await expect(signUp).toHaveAttribute("href", "/sign-up");
    await expect(page.getByRole("link", { name: /app\/login/i })).toHaveCount(0);

    // The guest diagnostic stays reachable from the menu.
    await expect(menu(page).getByRole("link", { name: /Diagnostic/i }).first()).toBeVisible();
  });

  test("Escape closes the menu and returns focus to the trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /menu/i }).first();
    await trigger.click();
    await expect(menu(page).getByRole("link", { name: /^Sign in$/i })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu(page)).toHaveCount(0);
    // Focus restoration: the trigger is focused again, so keyboard users
    // are not dropped at the top of the document.
    await expect(trigger).toBeFocused();
  });

  test("navigating to sign-in closes the menu", async ({ page }) => {
    await page.goto("/");
    await openMenu(page);
    await menu(page).getByRole("link", { name: /^Sign in$/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    // The menu is gone, not left open behind the new route.
    await expect(menu(page)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Sign in to MODUS/i })).toBeVisible();
  });

  test("a real signed-in session shows Clerk's account control on mobile", async ({ page }) => {
    test.skip(!env, "run scripts/create-test-users.mjs first");
    await page.goto("/");
    await signInAs(page, env!.MODUS_TEST_A_EMAIL);
    await page.goto("/");
    await openMenu(page);

    // Signed in: the sign-in/sign-up pair is replaced by Clerk's control.
    await expect(menu(page).getByRole("link", { name: /^Sign in$/i })).toHaveCount(0);
    await expect(
      menu(page).locator(".cl-userButtonTrigger, button[aria-label*='account' i], img[alt*='avatar' i]").first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test("signing out on mobile clears the session and restores the entry links", async ({ page }) => {
    test.skip(!env, "run scripts/create-test-users.mjs first");
    await page.goto("/");
    await signInAs(page, env!.MODUS_TEST_A_EMAIL);
    expect(await currentUserId(page)).toBe(env!.MODUS_TEST_A_USER_ID);

    await signOut(page);
    await page.goto("/");
    await openMenu(page);
    await expect(menu(page).getByRole("link", { name: /^Sign in$/i })).toBeVisible({ timeout: 20_000 });
    expect(await currentUserId(page)).toBeNull();
  });

  test("switching accounts on mobile does not leak the previous account", async ({ page }) => {
    test.skip(!env, "run scripts/create-test-users.mjs first");
    await page.goto("/");
    await signInAs(page, env!.MODUS_TEST_A_EMAIL);
    // Seed account A's saved diagnostic reference, as a submission would.
    await page.evaluate(
      ([key, value]) => window.localStorage.setItem(key, value),
      ["modus:customer-context:v1", JSON.stringify({
        contextToken: "tok_mobile_a", companyName: "Mobile A Company BV",
        savedAt: Date.now(), identity: env!.MODUS_TEST_A_USER_ID,
      })] as const
    );
    await page.reload();

    await signOut(page);
    await signInAs(page, env!.MODUS_TEST_B_EMAIL);
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // The data itself, not a hidden element.
    await expect(page.locator("body")).not.toContainText("Mobile A Company BV");
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem("modus:customer-context:v1")), { timeout: 10_000 })
      .toBeNull();
  });
});
