import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { signInAs, testAccounts } from "./clerkBrowserSession";

/**
 * The admin inbox, driven as a real signed-in administrator.
 *
 * This previously applied a Backend-API token as an `Authorization`
 * header, which exercised the API but proved nothing about browser login
 * or cookies. It now signs in through Clerk's own client, so the browser
 * holds real session cookies and the page is rendered for a real session
 * — the same path a person uses.
 *
 * The account is a throwaway development test user that holds an
 * `AdminMember` row in the LOCAL database only.
 */

const env = testAccounts();
const userId = env?.MODUS_TEST_A_USER_ID ?? null;
const SHOTS = "e2e-screens";

async function asAdmin(page: Page) {
  await page.goto("/");
  await signInAs(page, env!.MODUS_TEST_A_EMAIL);
}

test.describe("admin inbox", () => {
  test.skip(!env, "run scripts/create-test-users.mjs to create the isolated test accounts");
  test.describe.configure({ mode: "serial" });

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

test.describe("diagnostic detail", () => {
  test.skip(!env, "run scripts/create-test-users.mjs to create the isolated test accounts");
  test.describe.configure({ mode: "serial" });

  async function openFirst(page: Page) {
    await asAdmin(page);
    await page.goto("/private/diagnostics");
    const first = page.locator("tbody tr a").first();
    await expect(first).toBeVisible({ timeout: 15_000 });
    await first.click();
    await expect(page).toHaveURL(/\/private\/diagnostics\/[a-z0-9]+/i);
  }

  test("shows the submission and keeps a note when saving fails", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await openFirst(page);

    await expect(page.getByText(/Internal Notes/i)).toBeVisible();
    const composer = page.getByPlaceholder(/Add a private note/i);
    await composer.fill("Retry-state check — not saved on purpose.");

    // Fail the save once: the note must survive and a retry must be
    // offered, rather than the text being thrown away silently.
    let fail = true;
    await page.route("**/notes", async (route) => {
      if (fail) {
        fail = false;
        await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
      } else {
        await route.continue();
      }
    });

    await page.getByRole("button", { name: /^Save note$/i }).click();
    await expect(page.getByText(/Not saved — your note is still here/i)).toBeVisible({ timeout: 10_000 });
    await expect(composer).toHaveValue("Retry-state check — not saved on purpose.");

    await page.screenshot({ path: `${SHOTS}/private-detail-note-retry.png` });

    // Retry succeeds and the composer clears only then.
    await page.getByRole("button", { name: /Retry/i }).click();
    await expect(composer).toHaveValue("", { timeout: 10_000 });
  });

  test("QUALIFIED is preserved rather than collapsed into the workflow", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await openFirst(page);

    const select = page.getByLabel("Diagnostic status");
    await expect(select).toBeVisible();
    const options = await select.locator("option").allInnerTexts();
    // The four workflow states are offered...
    for (const label of ["New", "In review", "Contacted", "Closed"]) {
      expect(options, `missing workflow state ${label}`).toContain(label);
    }
    // ...and the wider stored vocabulary is still reachable, so a record
    // already marked Qualified keeps that value instead of being rewritten.
    expect(options).toContain("Qualified");

    await page.screenshot({ path: `${SHOTS}/private-detail-desktop.png` });
  });

  test("renders on a phone", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await openFirst(page);
    await expect(page.getByText(/Internal Notes/i)).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${SHOTS}/private-detail-mobile.png` });
  });
});
