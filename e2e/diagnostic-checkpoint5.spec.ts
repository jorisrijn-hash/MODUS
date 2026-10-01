import { execSync } from "node:child_process";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

/**
 * Checkpoint 5 — Diagnostic presentation/interaction redesign. These tests
 * cover what's new this checkpoint and isn't already exercised by
 * diagnostic.spec.ts's happy-path/optional-field coverage: the per-step
 * headline + minimal progress dots, the homepage entry-context hint
 * (Section 13), the submission-failure state (Section 19), and that the
 * diagnostic route's fluid field is disabled (Sections 14/22).
 */

async function clickFirstOptionNear(page: Page, headingText: string) {
  const heading = page.getByText(headingText, { exact: false }).first();
  await heading.locator("xpath=following-sibling::div[1]").locator("button").first().click();
}

const FAIL_TEST_EMAIL = "submit-fail@playwright-qa.dev";

test.afterEach(() => {
  const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
  try {
    execSync(`sqlite3 "${dbPath}" "DELETE FROM Diagnostic WHERE email='${FAIL_TEST_EMAIL}';"`);
  } catch {
    // sqlite3 CLI or dev.db not present — nothing to clean up.
  }
});

test("progress dots and step headline advance and retreat correctly", async ({ page }) => {
  await page.goto("/diagnostic");
  await page.getByRole("button", { name: /Start|Begin/i }).first().click();

  await expect(page.getByText("01 / 06")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tell us about your business." })).toBeVisible();

  await page.getByLabel("Company name").fill("Progress QA BV");
  await page.locator("select").first().selectOption({ index: 1 });
  await clickFirstOptionNear(page, "Employees");
  await clickFirstOptionNear(page, "Locations");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await expect(page.getByText("02 / 06")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How do customers reach you?" })).toBeVisible();

  await page.getByRole("button", { name: /^Back$/ }).click();
  await expect(page.getByText("01 / 06")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tell us about your business." })).toBeVisible();
  // Back-navigation shouldn't lose what was already filled in.
  await expect(page.getByLabel("Company name")).toHaveValue("Progress QA BV");
});

test("homepage diagnostic-entry category hint carries through as a non-authoritative visual note", async ({
  page,
}) => {
  await page.goto("/");
  const entryForm = page.locator("form").filter({ has: page.getByPlaceholder(/stuck/i) });
  await entryForm.getByRole("button", { name: "Website", exact: true }).click();
  await entryForm.getByRole("link", { name: "Run a Diagnostic" }).click();

  await expect(page).toHaveURL(/\/diagnostic\?hint=Website/);
  await expect(page.getByText("Continuing from", { exact: false }).first()).toBeVisible();

  // Purely visual — never pre-answers a real step. Starting the diagnostic
  // still lands on the unanswered first step.
  await page.getByRole("button", { name: /Start|Begin/i }).first().click();
  await expect(page.getByLabel("Company name")).toHaveValue("");
});

test("a failed submission shows a calm retry state, preserves answers, and a retry can then succeed", async ({
  page,
}) => {
  // Deterministic failure via network interception, rather than racing the
  // API's real 60s duplicate-email window (timing-dependent and flaky) —
  // this still exercises the real client-side failure path end to end
  // (submitDiagnostic sees `res.ok === false`, DiagnosticShell routes to
  // `submit_error`), it just controls the one external variable.
  let failNext = true;
  await page.route("**/api/diagnostic", async (route) => {
    if (failNext) {
      failNext = false;
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "fail" }) });
    } else {
      await route.continue();
    }
  });

  await page.goto("/diagnostic");
  await page.getByRole("button", { name: /Start|Begin/i }).first().click();

  await page.getByLabel("Company name").fill("Fail QA BV");
  await page.locator("select").first().selectOption({ index: 1 });
  await clickFirstOptionNear(page, "Employees");
  await clickFirstOptionNear(page, "Locations");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await clickFirstOptionNear(page, "reach you");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await clickFirstOptionNear(page, "runs your business");
  await clickFirstOptionNear(page, "connected are these systems");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await clickFirstOptionNear(page, "harder than it should");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await clickFirstOptionNear(page, "primarily interested in");
  await clickFirstOptionNear(page, "biggest difference");
  await clickFirstOptionNear(page, "ideally start");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await page.getByLabel("First name").fill("Fail");
  await page.getByLabel("Last name").fill("Case");
  await page.getByLabel("Work email").fill(FAIL_TEST_EMAIL);

  await page.getByRole("button", { name: /Review/i }).click();
  await expect(page.getByText(/review/i).first()).toBeVisible({ timeout: 5000 });

  const submitBtn = page.getByRole("button", { name: /Hold to Submit/i });
  await expect(submitBtn).toBeVisible();
  const box = await submitBtn.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1800);
    await page.mouse.up();
  }

  await expect(page.getByText("That didn't go through.")).toBeVisible({ timeout: 10000 });

  // The answers are still intact underneath, not wiped.
  await page.getByRole("button", { name: /Back to review/i }).click();
  await expect(page.getByText("Fail QA BV", { exact: false }).first()).toBeVisible();

  // Retry — the interceptor now lets the real request through, so this
  // real submission should succeed.
  const retryBtn = page.getByRole("button", { name: /Hold to Submit/i });
  await expect(retryBtn).toBeVisible();
  const retryBox = await retryBtn.boundingBox();
  if (retryBox) {
    await page.mouse.move(retryBox.x + retryBox.width / 2, retryBox.y + retryBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1800);
    await page.mouse.up();
  }
  await expect(page.getByText(/ESTIMATE|ENGAGEMENT/i).first()).toBeVisible({ timeout: 15000 });
});

test("diagnostic route does not mount the WebGL fluid field; homepage does", async ({ page }) => {
  await page.goto("/diagnostic");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toHaveCount(0);

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // The fluid field mounts lazily on the client; give it a moment.
  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 5000 });
});
