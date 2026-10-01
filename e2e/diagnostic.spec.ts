import { execSync } from "node:child_process";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = "ada@playwright-qa.dev";
const OPTIONAL_FIELD_TEST_EMAIL = "grace@playwright-qa.dev";

async function clickFirstOptionNear(page: Page, headingText: string) {
  const heading = page.getByText(headingText, { exact: false }).first();
  await heading.locator("xpath=following-sibling::div[1]").locator("button").first().click();
}

// This flow submits a real row to the local dev database (there's no
// staging/mock backend to point at instead), so clean it up afterward —
// scoped tightly to this test's own distinctive email, never a broad delete.
test.afterEach(() => {
  const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
  try {
    execSync(
      `sqlite3 "${dbPath}" "DELETE FROM Diagnostic WHERE email='${TEST_EMAIL}' OR email='${OPTIONAL_FIELD_TEST_EMAIL}';"`
    );
  } catch {
    // sqlite3 CLI or dev.db not present — nothing to clean up.
  }
});

test("full diagnostic happy path: intro -> review -> submit -> estimate", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/diagnostic");
  await page.getByRole("button", { name: /Start|Begin/i }).first().click();

  // Step 1: Business
  await page.getByLabel("Company name").fill("Playwright QA BV");
  await page.locator("select").first().selectOption({ index: 1 }); // industry
  await clickFirstOptionNear(page, "Employees");
  await clickFirstOptionNear(page, "Locations");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Step 2: Operations
  await clickFirstOptionNear(page, "reach you");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Step 3: Systems
  await clickFirstOptionNear(page, "runs your business");
  await clickFirstOptionNear(page, "connected are these systems");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Step 4: Friction
  await clickFirstOptionNear(page, "harder than it should");
  await page
    .getByLabel(/In your own words/i)
    .fill("Enquiries arrive through email and WhatsApp and sometimes follow-up gets missed for days.");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Step 5: Priorities
  await clickFirstOptionNear(page, "primarily interested in");
  await clickFirstOptionNear(page, "biggest difference");
  await clickFirstOptionNear(page, "ideally start");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Step 6: Contact (last step, "Continue" becomes "Review")
  await page.getByLabel("First name").fill("Ada");
  await page.getByLabel("Last name").fill("Lovelace");
  await page.getByLabel("Work email").fill(TEST_EMAIL);
  await page.getByRole("button", { name: /Review/i }).click();

  await expect(page.getByText(/review/i).first()).toBeVisible({ timeout: 5000 });

  // Hold-to-confirm: press and hold for >1.1s rather than a simple click
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

  await expect(page.getByText(/ESTIMATE|ENGAGEMENT/i).first()).toBeVisible({ timeout: 15000 });
  expect(errors, `console errors during diagnostic flow:\n${errors.join("\n")}`).toEqual([]);
});

test("the 'what goes wrong' free-text field is optional: submission succeeds when left blank", async ({ page }) => {
  await page.goto("/diagnostic");
  await page.getByRole("button", { name: /Start|Begin/i }).first().click();

  await page.getByLabel("Company name").fill("Optional Field QA BV");
  await page.locator("select").first().selectOption({ index: 1 });
  await clickFirstOptionNear(page, "Employees");
  await clickFirstOptionNear(page, "Locations");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await clickFirstOptionNear(page, "reach you");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await clickFirstOptionNear(page, "runs your business");
  await clickFirstOptionNear(page, "connected are these systems");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Friction step: pick an area, but deliberately leave "In your own
  // words" blank — this is the field being made optional.
  await clickFirstOptionNear(page, "harder than it should");
  const descriptionField = page.getByLabel(/In your own words/i);
  await expect(descriptionField).toHaveValue("");
  // The field's own label should now read "Optional", not "Required".
  await expect(page.getByText(/In your own words/i).locator("..").getByText(/optional/i)).toBeVisible();
  const nextButton = page.getByRole("button", { name: /^Continue$/ });
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  await clickFirstOptionNear(page, "primarily interested in");
  await clickFirstOptionNear(page, "biggest difference");
  await clickFirstOptionNear(page, "ideally start");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await page.getByLabel("First name").fill("Grace");
  await page.getByLabel("Last name").fill("Hopper");
  await page.getByLabel("Work email").fill(OPTIONAL_FIELD_TEST_EMAIL);
  await page.getByRole("button", { name: /Review/i }).click();
  await expect(page.getByText(/review/i).first()).toBeVisible({ timeout: 5000 });

  const submitBtn = page.getByRole("button", { name: /Hold to Submit/i });
  const box = await submitBtn.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1800);
    await page.mouse.up();
  }

  await expect(page.getByText(/ESTIMATE|ENGAGEMENT/i).first()).toBeVisible({ timeout: 15000 });
});
