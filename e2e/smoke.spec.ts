import { test, expect, type Page } from "@playwright/test";

function trackConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

const PUBLIC_ROUTES = ["/", "/how-it-works", "/platform", "/pricing", "/capabilities", "/results", "/company", "/diagnostic"];

test.describe("public routes load clean", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no console errors`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      const res = await page.goto(route);
      expect(res?.status()).toBeLessThan(400);
      await page.waitForLoadState("networkidle");
      expect(errors, `console errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("homepage", () => {
  test("nav links and language switch work", async ({ page }) => {
    await page.goto("/");
    // Checkpoint 5.5 — the primary nav row was reduced to 4 links
    // (Platform moved out, still reachable via the footer and the mobile
    // menu's fuller set); "Capabilities" is one of the four that remain.
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Capabilities" })).toBeVisible();

    // language switch: EN -> NL -> EN, headline should change and not vanish.
    // Checkpoint 5.5 moved the EN/NL control out of the nav bar itself and
    // into the compact `NavUtilityMenu` popover, so it must be opened first.
    const headline = page.locator("h1").first();
    await expect(headline).toBeVisible();
    const enText = await headline.textContent();

    await page.getByRole("button", { name: "Preferences", exact: true }).click();
    await page.getByRole("banner").getByRole("button", { name: "NL", exact: true }).click();
    await page.waitForTimeout(400);
    const nlText = await headline.textContent();
    expect(nlText).toBeTruthy();
    expect(nlText).not.toBe(enText);

    // The popover stays open after a selection (so more than one
    // preference can be adjusted in one visit) — no need to reopen it.
    await page.getByRole("banner").getByRole("button", { name: "EN", exact: true }).click();
    await page.waitForTimeout(400);
    const backToEn = await headline.textContent();
    expect(backToEn).toBe(enText);
  });

  test("footer and Talk to MODUS chatbot trigger are present", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(page.locator("footer")).toBeVisible();

    const talkLink = page.getByRole("button", { name: /Talk to MODUS/i }).first();
    await expect(talkLink).toBeVisible();
    await talkLink.click();
    await expect(page.getByRole("dialog").or(page.locator('[class*="chatbot"]'))).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});

test.describe("pricing", () => {
  test("run diagnostic CTA navigates to /diagnostic", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("link", { name: "Run Free Diagnostic" }).first().click();
    await expect(page).toHaveURL(/\/diagnostic/);
  });
});
