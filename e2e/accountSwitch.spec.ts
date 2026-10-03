import { test, expect, type Page } from "@playwright/test";
import { signInAs, signOut, currentUserId, testAccounts } from "./clerkBrowserSession";

/**
 * The signed-in account-switch case, in a real browser with two real
 * sessions and real Clerk cookies.
 *
 * This was blocked. `clerk.signIn({ strategy: "password" })` returned
 * without throwing and left `Clerk.session` null. The cause was not the
 * username requirement — the instance's own environment reports
 * `password.used_for_first_factor: false` with an empty `first_factors`,
 * and the only first factor on `email_address` is `email_code`. Password
 * is simply not a sign-in strategy here.
 *
 * The accounts are now Clerk test addresses and the sign-in goes through
 * Clerk's own client end to end, so the browser holds genuine `__session`
 * and `__client_uat` cookies. See `clerkBrowserSession.ts`.
 */

const env = testAccounts();
const KEY = "modus:customer-context:v1";

test.describe("switching accounts at the same browser", () => {
  test.skip(!env, "run scripts/create-test-users.mjs to create the isolated test accounts");
  test.describe.configure({ mode: "serial" });

  const signIn = (page: Page, which: "A" | "B") => signInAs(page, env![`MODUS_TEST_${which}_EMAIL`]);

  const stored = (page: Page) => page.evaluate((k) => window.localStorage.getItem(k), KEY);

  test("account B never sees account A's saved diagnostic state", async ({ page }) => {
    await page.goto("/");
    await signIn(page, "A");
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Save a reference AS account A, the way a submission would.
    const userIdA = env!.MODUS_TEST_A_USER_ID;
    await page.evaluate(
      ([key, value]) => window.localStorage.setItem(key, value),
      [KEY, JSON.stringify({ contextToken: "tok_account_a", companyName: "Account A Company BV", savedAt: Date.now(), identity: userIdA })] as const
    );
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(await stored(page), "A's own reference should be kept for A").not.toBeNull();

    // Switch accounts.
    await signOut(page);
    await page.goto("/");
    await signIn(page, "B");
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The data itself, not a hidden element.
    await expect(page.locator("body")).not.toContainText("Account A Company BV");
    await expect.poll(() => stored(page), { timeout: 8000 }).toBeNull();

    // And the diagnostic does not open A's profile for B.
    await page.goto("/diagnostic");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/PROFILE READY/i)).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("Account A Company BV");
  });

  test("an ordinary signed-in account gets no admin tab and no admin data", async ({ page, context }) => {
    await page.goto("/");
    await signIn(page, "B");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Not merely hidden UI: the server is asked directly.
    const status = await page.evaluate(async () => (await fetch("/api/admin/status", { cache: "no-store" })).json());
    expect(status).toEqual({ admin: false });

    expect(context.pages(), "no admin tab for an ordinary account").toHaveLength(1);
    await expect(page.getByRole("link", { name: /Open admin inbox/i })).toHaveCount(0);

    // Direct API authorization, not the UI's opinion of it.
    const overview = await page.evaluate(async () => {
      const r = await fetch("/api/private/overview", { cache: "no-store" });
      return { status: r.status, body: (await r.text()).slice(0, 200) };
    });
    expect(overview.status, "ordinary account must be refused").toBe(403);
    expect(overview.body).not.toMatch(/companyName|firstName/i);
  });

  test("signing out clears private state and restores the generic site", async ({ page }) => {
    await page.goto("/");
    await signIn(page, "A");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(
      ([key, value]) => window.localStorage.setItem(key, value),
      [KEY, JSON.stringify({ contextToken: "tok_account_a", companyName: "Account A Company BV", savedAt: Date.now(), identity: env!.MODUS_TEST_A_USER_ID })] as const
    );

    await signOut(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).not.toContainText("Account A Company BV");
    await expect.poll(() => stored(page), { timeout: 8000 }).toBeNull();
    await expect(page.locator("header").getByRole("link", { name: /Run a Diagnostic/i })).toBeVisible();
  });
});
