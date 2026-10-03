import { test, expect, type Page } from "@playwright/test";

/**
 * Account isolation, verified against the running app.
 *
 * The saved Diagnostic reference is a capability token plus a company
 * name. It used to be scoped to the browser rather than to an account, so
 * after a sign-out or an account switch the next person was shown the
 * previous account's company name and offered their profile.
 *
 * Clerk is not signed in during these runs, so the live identity is
 * "guest". That is enough to prove the rule in both directions: a
 * reference belonging to a signed-in account must not be honoured for a
 * guest, and the guest's own reference must still work — the second half
 * matters, because a change that simply broke the feature would pass the
 * first half on its own.
 */

const KEY = "modus:customer-context:v1";

async function seed(page: Page, identity: string, companyName: string) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [
      KEY,
      JSON.stringify({ contextToken: "tok_not_a_real_token", companyName, savedAt: Date.now(), identity }),
    ] as const
  );
}

const stored = (page: Page) => page.evaluate((k) => window.localStorage.getItem(k), KEY);

test.describe("a reference belonging to another account", () => {
  test("is neither shown nor kept, and the generic site is restored", async ({ page }) => {
    await seed(page, "user_someone_else", "Another Persons Company BV");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The data itself, not merely a hidden element: the company name must
    // not appear anywhere in the rendered page.
    await expect(page.locator("body")).not.toContainText("Another Persons Company BV");

    // The navigation offers the generic action, not "Continue"/"View
    // Profile" built from someone else's state.
    await expect(page.locator("header").getByRole("link", { name: /Run a Diagnostic/i })).toBeVisible();

    // And the token is gone from storage, not just ignored — otherwise
    // anyone with the device could read it out and call the public
    // context endpoint with it.
    await expect.poll(() => stored(page), { timeout: 5000 }).toBeNull();
  });

  test("does not open the profile screen on /diagnostic", async ({ page }) => {
    await seed(page, "user_someone_else", "Another Persons Company BV");

    await page.goto("/diagnostic");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/PROFILE READY/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Start|Begin/i }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Another Persons Company BV");
  });

  test("survives a reload and browser Back without reappearing", async ({ page }) => {
    await seed(page, "user_someone_else", "Another Persons Company BV");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    await page.goBack();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Another Persons Company BV");

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Another Persons Company BV");
    expect(await stored(page)).toBeNull();
  });
});

test.describe("the current identity's own reference still works", () => {
  test("a guest reference is honoured and kept", async ({ page }) => {
    await seed(page, "guest", "Guest Owned Company BV");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Still present: scoping must not be implemented by deleting
    // everything, which would pass the isolation tests while removing the
    // feature.
    expect(await stored(page)).not.toBeNull();
    await expect(
      page.locator("header").getByRole("link", { name: /Run a Diagnostic/i })
    ).toHaveCount(0);
  });
});

test.describe("the admin tab never opens for a non-admin", () => {
  test("no second tab is opened for an anonymous visitor", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    // Signing in is not a reason to open the admin inbox; confirmed
    // membership is. An anonymous visitor must never see it.
    expect(context.pages()).toHaveLength(1);
    await expect(page.getByRole("link", { name: /Open admin inbox/i })).toHaveCount(0);
  });

  test("/api/admin/status is the authority and answers false here", async ({ request }) => {
    const res = await request.get("/api/admin/status");
    expect(res.ok()).toBe(true);
    expect(await res.json()).toEqual({ admin: false });
  });
});
