import { test, expect, type Locator, type Page } from "@playwright/test";
import { holdToSubmit } from "./holdToSubmit";

/**
 * The diagnostic's sphere -> layers -> stack -> closure graphic, verified
 * through the real journey rather than through the geometry module's unit
 * tests.
 *
 * The unit tests assert the state mapping only: given a screen and a step,
 * which stage. They cannot see whether the scene is mounted on that
 * screen, whether it renders, whether it sits on top of a question, or
 * whether it updates at all when `prefers-reduced-motion` is set. Each of
 * those has been wrong at some point, so each is asserted here against the
 * running app.
 */

const DESKTOP = { width: 1440, height: 900 };
const SHOTS = "e2e-screens";

async function clickFirstOptionNear(page: Page, headingText: string) {
  const heading = page.getByText(headingText, { exact: false }).first();
  await heading.locator("xpath=following-sibling::div[1]").locator("button").first().click();
}

/**
 * Screenshot after the stage transition has settled. The topic labels
 * carry a 300ms CSS opacity transition and the point cloud eases toward
 * its new targets, so a capture taken the moment an assertion passes
 * shows the scene mid-morph and is not representative of what a visitor
 * sees.
 */
async function shot(page: Page, name: string, scroll: "top" | "bottom" = "top") {
  // Filling and clicking fields scrolls them into view, so by the end of a
  // step the page is left part-way down and a capture taken there is not
  // what a visitor arriving on the screen sees. Park the page explicitly.
  await page.evaluate((to) => window.scrollTo(0, to === "top" ? 0 : document.body.scrollHeight), scroll);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

/** The scene's canvas. The form screens have no other canvas. */
function scene(page: Page) {
  return page.locator("canvas");
}

/**
 * The scene is decorative and sits behind the content, but the page has no
 * opaque background — so points drawn under a paragraph show through it.
 * "Behind" is not sufficient; it must not be over the content at all.
 */
async function expectClearOf(
  page: Page,
  what: Locator,
  label: string,
  // A block-level heading or paragraph fills its container's width even
  // when its text does not, so its border box is not where the reader's
  // eye is. For those, measure the rendered glyphs instead. Interactive
  // controls keep their border box: overlapping a button's padding is a
  // real collision even where no glyph sits.
  mode: "box" | "text" = "box"
) {
  const a = await scene(page).first().boundingBox();
  const b =
    mode === "box"
      ? await what.boundingBox()
      : await what.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
          if (!rects.length) return null;
          const left = Math.min(...rects.map((r) => r.left));
          const top = Math.min(...rects.map((r) => r.top));
          return {
            x: left,
            y: top,
            width: Math.max(...rects.map((r) => r.right)) - left,
            height: Math.max(...rects.map((r) => r.bottom)) - top,
          };
        });
  expect(a, "scene canvas should be present").not.toBeNull();
  expect(b, `${label} should be present`).not.toBeNull();
  const disjoint =
    a!.x + a!.width <= b!.x ||
    b!.x + b!.width <= a!.x ||
    a!.y + a!.height <= b!.y ||
    b!.y + b!.height <= a!.y;
  expect(
    disjoint,
    `the scene overlaps ${label}: scene=${JSON.stringify(a)} ${label}=${JSON.stringify(b)}`
  ).toBe(true);
}

/** Inline opacity of a projected topic label, written by the render path. */
async function labelOpacity(page: Page, layer: number): Promise<number> {
  return Number(
    await page.locator(`[data-layer="${layer}"]`).evaluate((el) => (el as HTMLElement).style.opacity || "0")
  );
}

async function fillStep1(page: Page, company: string) {
  await page.getByLabel("Company name").fill(company);
  await page.locator("select").first().selectOption({ index: 1 });
  await clickFirstOptionNear(page, "Employees");
  await clickFirstOptionNear(page, "Locations");
}

/** Steps 2..5, leaving the contact step open. */
async function answerThroughPriorities(page: Page) {
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
}

test.describe("diagnostic scene through the real journey", () => {
  test.use({ viewport: DESKTOP });
  // These walk the whole six-step flow and pause for each stage to settle
  // before capturing it, which does not fit the default per-test budget.
  test.setTimeout(90_000);

  test("every stage mounts, renders, and stays clear of the content", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    // --- entry: the sphere -------------------------------------------
    await page.goto("/diagnostic");
    await expect(scene(page)).toHaveCount(1);
    await expectClearOf(page, page.getByRole("heading").first(), "the entry heading", "text");
    // Naming topics at entry would imply progress that has not happened.
    expect(await labelOpacity(page, 0)).toBe(0);
    await shot(page, "01-entry-sphere");

    // --- answering: separated layers, active topic emphasised --------
    await page.getByRole("button", { name: /Start|Begin/i }).first().click();
    await expect(page.getByText("01 / 06")).toBeVisible();
    await expect(scene(page)).toHaveCount(1);
    // The scene must not cover the question or the controls.
    await expectClearOf(page, page.getByLabel("Company name"), "the company-name field");
    await expectClearOf(
      page,
      page.getByRole("heading", { name: /Tell us about your business/i }),
      "the question heading",
      "text"
    );
    // The first topic reads as active; a later one is present but quiet.
    await expect.poll(() => labelOpacity(page, 0), { timeout: 4000 }).toBe(1);
    expect(await labelOpacity(page, 3)).toBeLessThan(1);
    await shot(page, "02-layers-step1");

    // The active layer tracks the real step, not a decorative counter.
    await fillStep1(page, "Scene QA BV");
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await expect(page.getByText("02 / 06")).toBeVisible();
    await expect.poll(() => labelOpacity(page, 1), { timeout: 4000 }).toBe(1);
    expect(await labelOpacity(page, 0)).toBeLessThan(1);
    await shot(page, "03-layers-step2");
    // The layers sit beneath the `sticky` ProfilePanel, in the lower part
    // of the right column, so this is where they are seen in full.
    await shot(page, "03b-layers-scrolled", "bottom");

    // Back navigation resolves to the earlier layer rather than queueing.
    await page.getByRole("button", { name: /^Back$/ }).click();
    await expect(page.getByText("01 / 06")).toBeVisible();
    await expect.poll(() => labelOpacity(page, 0), { timeout: 4000 }).toBe(1);

    // --- review: the composed stack ----------------------------------
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
    await page.getByLabel("First name").fill("Scene");
    await page.getByLabel("Last name").fill("QA");
    await page.getByLabel("Work email").fill(`scene-${Date.now()}@playwright-qa.dev`);
    await page.getByRole("button", { name: /Review/i }).click();
    await expect(page.getByText(/review/i).first()).toBeVisible({ timeout: 5000 });

    await expect(scene(page)).toHaveCount(1);
    const submitBtn = page.getByRole("button", { name: /Hold to Submit/i });
    await expectClearOf(page, submitBtn, "the submit button");
    await expectClearOf(
      page,
      page.getByRole("heading", { name: /Review your business profile/i }),
      "the review heading",
      "text"
    );
    /*
     * Every row's EDIT control, not just one. These sit at the right-hand
     * end of the review column — the edge nearest the scene — so they are
     * what a mispositioned gutter would collide with first. Asserting
     * each of them is what caught the column being full-width.
     */
    const editControls = page.getByRole("button", { name: /^edit$/i });
    const editCount = await editControls.count();
    expect(editCount, "the review screen should offer per-row EDIT controls").toBeGreaterThan(0);
    for (let i = 0; i < editCount; i++) {
      await expectClearOf(page, editControls.nth(i), `EDIT control ${i + 1} of ${editCount}`);
    }
    // Topic labels belong to the question stages; the stack is unlabelled.
    await expect.poll(() => labelOpacity(page, 0), { timeout: 4000 }).toBe(0);
    await shot(page, "04-review-stack");

    // --- closure: only after the server acknowledges ------------------
    await holdToSubmit(page, submitBtn);
    await expect(page.getByText(/ESTIMATE|ENGAGEMENT/i).first()).toBeVisible({ timeout: 15000 });
    await expect(scene(page)).toHaveCount(1);
    await expectClearOf(page, page.getByRole("heading").first(), "the estimate heading", "text");
    await shot(page, "05-result-closure");

    // --- profile: the closure as the screen's subject ------------------
    // Returning to /diagnostic with a completed diagnostic lands on the
    // profile-ready screen, whose two-column grid has only one child — so
    // the closure composition occupies the empty column rather than
    // accompanying content from the margin.
    await page.goto("/diagnostic");
    await expect(page.getByText(/PROFILE READY/i)).toBeVisible({ timeout: 10000 });
    await expect(scene(page)).toHaveCount(1);
    await expectClearOf(page, page.getByRole("heading").first(), "the profile heading", "text");
    await expectClearOf(
      page,
      page.getByRole("button", { name: /Start a new diagnostic/i }),
      "the start-new control"
    );
    expect(await labelOpacity(page, 0)).toBe(0);
    await shot(page, "10-profile-closure");

    expect(errors, `console errors across the scene journey:\n${errors.join("\n")}`).toEqual([]);
  });

  test("a failed submission holds the review stack and does not reach closure", async ({ page }) => {
    // The scene must never anticipate success. On failure it stays in the
    // review structure, because nothing has been persisted.
    await page.route("**/api/diagnostic", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "fail" }) })
    );

    await page.goto("/diagnostic");
    await page.getByRole("button", { name: /Start|Begin/i }).first().click();
    await fillStep1(page, "Scene Fail BV");
    await answerThroughPriorities(page);
    await page.getByLabel("First name").fill("Scene");
    await page.getByLabel("Last name").fill("Fail");
    await page.getByLabel("Work email").fill(`scene-fail-${Date.now()}@playwright-qa.dev`);
    await page.getByRole("button", { name: /Review/i }).click();
    await expect(page.getByText(/review/i).first()).toBeVisible({ timeout: 5000 });

    await holdToSubmit(page, page.getByRole("button", { name: /Hold to Submit/i }));
    await expect(page.getByText("That didn't go through.")).toBeVisible({ timeout: 10000 });

    // Still mounted, still the stack, still unlabelled — and crucially the
    // estimate screen was never reached.
    await expect(scene(page)).toHaveCount(1);
    expect(await labelOpacity(page, 0)).toBe(0);
    await expect(page.getByText(/ESTIMATE|ENGAGEMENT/i)).toHaveCount(0);
    await expectClearOf(page, page.getByText("That didn't go through."), "the failure message", "text");
    await shot(page, "06-submit-error-stack");
  });

  test("reduced motion still advances the stages, it just does not animate them", async ({ page }) => {
    // The regression this guards: with no frame loop running, a stage
    // change had nothing to pick it up, so the scene stayed frozen on
    // whatever composition it mounted with. A visitor who prefers reduced
    // motion saw the entry sphere for the entire journey.
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/diagnostic");
    await expect(scene(page)).toHaveCount(1);
    expect(await labelOpacity(page, 0)).toBe(0); // sphere: unlabelled
    await shot(page, "07-reduced-entry");

    await page.getByRole("button", { name: /Start|Begin/i }).first().click();
    await expect(page.getByText("01 / 06")).toBeVisible();
    // Rendered once for the layers stage, without animating into it.
    await expect.poll(() => labelOpacity(page, 0), { timeout: 4000 }).toBe(1);
    await shot(page, "08-reduced-layers-step1");

    await fillStep1(page, "Reduced Motion BV");
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await expect(page.getByText("02 / 06")).toBeVisible();
    await expect.poll(() => labelOpacity(page, 1), { timeout: 4000 }).toBe(1);
    expect(await labelOpacity(page, 0)).toBeLessThan(1);
    await shot(page, "09-reduced-layers-step2");
  });

  test("below the layout's threshold the scene is not mounted at all", async ({ page }) => {
    // Not merely hidden with CSS: a hidden canvas still holds a WebGL
    // context. This is the invariant diagnostic-checkpoint5 also protects
    // for phones, asserted here for the later stages too.
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto("/diagnostic");
    await page.waitForLoadState("networkidle");
    await expect(scene(page)).toHaveCount(0);

    await page.getByRole("button", { name: /Start|Begin/i }).first().click();
    await expect(page.getByText("01 / 06")).toBeVisible();
    await expect(scene(page)).toHaveCount(0);

    // The review-family screens need a wider gutter than 1024px, so at
    // 1100 the entry sphere mounts but the review stack does not.
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto("/diagnostic");
    await expect(scene(page)).toHaveCount(1);
  });
});
