import { test, expect, type Page } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { readFileSync } from "node:fs";

/**
 * The signed-in account-switch case, in a real browser with two real
 * sessions.
 *
 * Everything else about account isolation is asserted with Clerk signed
 * out, where the identity is "guest". That proves both directions of the
 * rule but never exercises the case the bug was actually reported for:
 * one signed-in account followed by another at the same browser.
 *
 * Runs against the DEVELOPMENT Clerk instance with two isolated accounts
 * created by `scripts/create-test-users.mjs`. It skips itself when those
 * are not configured, so a routine run is unaffected and no production
 * account is ever involved.
 */

function testEnv(): Record<string, string> | null {
  const env: Record<string, string> = {};
  for (const file of [".env.test.local", ".env.local", ".env"]) {
    try {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
        if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {}
  }
  // clerkSetup() reads these from process.env; Playwright does not load
  // .env files itself.
  process.env.CLERK_PUBLISHABLE_KEY ||= env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  process.env.CLERK_SECRET_KEY ||= env.CLERK_SECRET_KEY;
  return env.MODUS_TEST_A_EMAIL && env.MODUS_TEST_B_EMAIL ? env : null;
}

const env = testEnv();

/*
 * Opt-in, and currently NOT passing.
 *
 * The accounts and the helper are in place, but `clerk.signIn()` does not
 * establish a session against this development instance: it returns
 * without throwing and `window.Clerk.session` stays null, so every
 * assertion below runs as a signed-out visitor and the first one fails
 * for the wrong reason. Rather than leave a red suite or, worse, soften
 * the assertions until it passes while proving nothing, this is gated
 * behind an explicit flag and recorded as an open gap in
 * PROJECT-STATUS.md.
 *
 *   MODUS_CLERK_SWITCH_TEST=1 npx playwright test e2e/accountSwitch.spec.ts
 */
const ENABLED = process.env.MODUS_CLERK_SWITCH_TEST === "1";
const KEY = "modus:customer-context:v1";

test.describe("switching accounts at the same browser", () => {
  test.skip(
    !ENABLED || !env,
    "set MODUS_CLERK_SWITCH_TEST=1 after running scripts/create-test-users.mjs. " +
      "Known blocker: clerk.signIn() does not establish a session on this instance."
  );
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    await clerkSetup();
  });

  const signIn = async (page: Page, which: "A" | "B") => {
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: env![`MODUS_TEST_${which}_EMAIL`],
        password: env![`MODUS_TEST_${which}_PASSWORD`],
      },
    });
  };

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
    await clerk.signOut({ page });
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

    await clerk.signOut({ page });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).not.toContainText("Account A Company BV");
    await expect.poll(() => stored(page), { timeout: 8000 }).toBeNull();
    await expect(page.locator("header").getByRole("link", { name: /Run a Diagnostic/i })).toBeVisible();
  });
});
