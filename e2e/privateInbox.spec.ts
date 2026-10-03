import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/**
 * The admin inbox, driven as a real signed-in administrator.
 *
 * `clerk.signIn()` does not work against this instance (see
 * PROJECT-STATUS §21), so the session is established the other way: a
 * development Clerk session token is minted through the Backend API —
 * which development instances allow and production does not — and set as
 * the session cookie. The account is a throwaway test user that holds an
 * `AdminMember` row in the LOCAL database only.
 *
 * This is what makes it possible to check the redesign against the real
 * screen rather than asserting that components mount.
 */

function testUserId(): string | null {
  try {
    for (const line of readFileSync(".env.test.local", "utf8").split("\n")) {
      const m = line.match(/^MODUS_TEST_A_USER_ID=(.*)$/);
      if (m) return m[1];
    }
  } catch {}
  return null;
}

const userId = testUserId();
const SHOTS = "e2e-screens";

let token: string | null = null;
try {
  token = userId
    ? execFileSync("node", ["scripts/mint-dev-session.mjs", userId], { encoding: "utf8" }).trim()
    : null;
} catch {
  token = null;
}

/**
 * Clerk does not accept a hand-set `__session` cookie here — its Next
 * integration expects its own handshake cookies alongside it, and a
 * cookie-only attempt reports `admin: false`. The same token in an
 * `Authorization` header is accepted and reports `admin: true`, so the
 * header is applied to every request in the context, navigations
 * included.
 */
async function asAdmin(page: Page) {
  await page.context().setExtraHTTPHeaders({ Authorization: `Bearer ${token}` });
}

test.describe("admin inbox", () => {
  test.skip(!token, "needs a development Clerk session — run scripts/create-test-users.mjs first");

  test("lists real diagnostics with search, status and date filters", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await asAdmin(page);
    await page.goto("/private/diagnostics");

    // Not a redirect to sign-in: the session is genuinely admitted.
    await expect(page).toHaveURL(/\/private\/diagnostics/);
    await expect(page.getByRole("heading", { name: /Submitted diagnostics/i })).toBeVisible();

    const rows = page.locator("tbody tr");
    await expect.poll(() => rows.count(), { timeout: 15_000 }).toBeGreaterThan(0);
    const before = await rows.count();

    // Real server-side search: a nonsense term must empty the list and
    // say so, rather than leave the previous rows on screen.
    await page.getByPlaceholder(/Company, contact, email or website/i).fill("zzz-no-such-company-zzz");
    await expect(page.getByText(/No diagnostics match these filters/i)).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /Clear filters/i }).click();
    await expect.poll(() => rows.count(), { timeout: 15_000 }).toBe(before);

    // Date filter: a range entirely in the past yields nothing.
    // Scoped to the date inputs: a bare "To" also matches Next's dev
    // tools button in development.
    await page.locator('input[type="date"]').first().fill("2000-01-01");
    await page.locator('input[type="date"]').nth(1).fill("2000-01-02");
    await expect(page.getByText(/No diagnostics match these filters/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Clear filters/i }).click();
    await expect.poll(() => rows.count(), { timeout: 15_000 }).toBeGreaterThan(0);

    await page.screenshot({ path: `${SHOTS}/private-inbox-desktop.png` });
  });

  test("paginates instead of silently truncating", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await asAdmin(page);
    await page.goto("/private/diagnostics");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 15_000 });

    const summary = page.getByText(/\d+–\d+ of \d+/);
    await expect(summary).toBeVisible();
    const text = (await summary.textContent()) ?? "";
    const total = Number(text.match(/of (\d+)/)?.[1] ?? "0");

    if (total > 25) {
      const first = await page.locator("tbody tr").first().innerText();
      await page.getByRole("button", { name: /^Next$/ }).click();
      await expect(page.getByText(/Page 2 of/)).toBeVisible({ timeout: 15_000 });
      // A different page of results, not the same rows again.
      await expect.poll(async () => page.locator("tbody tr").first().innerText(), { timeout: 15_000 }).not.toBe(first);
      await page.getByRole("button", { name: /^Previous$/ }).click();
      await expect(page.getByText(/Page 1 of/)).toBeVisible({ timeout: 15_000 });
    } else {
      // Fewer than one page locally: assert the control is honest about
      // it rather than skipping the check entirely.
      await expect(page.getByRole("button", { name: /^Next$/ })).toHaveCount(0);
    }
  });

  test("shows an error state with a retry, not a blank list", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await asAdmin(page);

    let fail = true;
    await page.route("**/api/private/diagnostics**", async (route) => {
      if (fail) {
        fail = false;
        await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
      } else {
        await route.continue();
      }
    });

    await page.goto("/private/diagnostics");
    await expect(page.getByText(/That didn't load/i)).toBeVisible({ timeout: 15_000 });
    await page.screenshot({ path: `${SHOTS}/private-inbox-error.png` });

    await page.getByRole("button", { name: /Try again/i }).click();
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 15_000 });
  });

  test("renders on a phone", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await asAdmin(page);
    await page.goto("/private/diagnostics");
    await expect(page.getByRole("heading", { name: /Submitted diagnostics/i })).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/private-inbox-mobile.png` });
  });

  test("a revoked admin is refused on the very next request", async ({ page }) => {
    test.setTimeout(60_000);
    await asAdmin(page);
    await page.goto("/private/diagnostics");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 15_000 });

    execFileSync("node", ["scripts/grant-admin.mjs", "--revoke", userId!], { encoding: "utf8" });
    try {
      // Same session, no sign-out: the API refuses immediately.
      const status = await page.evaluate(async () => (await fetch("/api/private/diagnostics", { cache: "no-store" })).status);
      expect(status).toBe(403);
      await page.goto("/private/diagnostics");
      await expect(page).toHaveURL(/\/sign-in/);
    } finally {
      execFileSync("node", ["scripts/grant-admin.mjs", userId!], { encoding: "utf8" });
    }
  });
});
