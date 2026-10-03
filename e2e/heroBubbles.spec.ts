import { test, expect, type Page } from "@playwright/test";

/**
 * The hero's process bubbles.
 *
 * They were reported missing on the deployed site. They were not missing:
 * the element existed, the cycle ran and the text changed on every pass.
 * They were positioned in CANVAS space while being absolutely positioned
 * inside the ANCHOR, and the canvas is deliberately overscanned to the
 * size of the hero — so the bubble was placed up to a full overscan to
 * the right. Measured on production at x≈1790 in a 1440px viewport, which
 * is outside the hero's `overflow: hidden` box, so every bubble was
 * clipped away.
 *
 * Nothing in the suite noticed, because "is the element present and
 * animating" was true throughout. These assert the thing that was
 * actually broken: where it ends up on screen.
 */

const BUBBLE = 'div[data-state][aria-hidden="true"]';

async function sample(page: Page) {
  return page.evaluate((sel) => {
    const d = document.querySelector(sel) as HTMLElement | null;
    if (!d) return null;
    const b = d.getBoundingClientRect();
    return {
      state: d.dataset.state,
      opacity: Number(getComputedStyle(d).opacity),
      text: d.textContent?.trim() ?? "",
      left: b.left,
      top: b.top,
      right: b.right,
      bottom: b.bottom,
      insideViewport: b.left >= 0 && b.right <= window.innerWidth && b.top >= 0 && b.bottom <= window.innerHeight,
    };
  }, BUBBLE);
}

test.describe("hero process bubbles", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("appear on screen, inside the hero, and are never clipped away", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const seen: string[] = [];
    let everVisible = false;
    let everOutside = false;

    // Watch several cycles: hold is 3s with a 2s gap, so this spans more
    // than one bubble.
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(900);
      const s = await sample(page);
      expect(s, "the bubble element should exist").not.toBeNull();
      if (s!.state === "in" && s!.opacity > 0.5) {
        everVisible = true;
        if (s!.text) seen.push(s!.text);
        // The real defect: positioned outside the viewport and clipped.
        if (!s!.insideViewport) everOutside = true;
      }
    }

    expect(everVisible, "a bubble should become visible within ~9s").toBe(true);
    expect(
      everOutside,
      "a visible bubble was positioned outside the viewport and would be clipped by the hero"
    ).toBe(false);
    expect(seen.length, "a bubble should carry its label text").toBeGreaterThan(0);
  });

  test("the label changes between cycles rather than repeating one", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    /*
     * Condition-based rather than a fixed number of samples. A cycle is
     * ~5s (3s hold, 2s gap) and the loop only advances while the scene is
     * visible and the tab is active, so under load fewer cycles complete
     * in a given wall-clock window — which made a fixed sample count fail
     * intermittently in a full-suite run while passing in isolation.
     * `pickBubble` cannot repeat an index consecutively, so two distinct
     * labels is the right assertion; it just needs long enough to see
     * two bubbles.
     */
    const labels = new Set<string>();
    await expect
      .poll(
        async () => {
          const s = await sample(page);
          if (s?.state === "in" && s.opacity > 0.5 && s.text) labels.add(s.text);
          return labels.size;
        },
        { timeout: 40_000, intervals: [400] }
      )
      .toBeGreaterThan(1);
  });

  test("they sit over the scene, not over the headline column", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const heading = await page.getByRole("heading", { level: 1 }).first().boundingBox();
    expect(heading).not.toBeNull();

    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(900);
      const s = await sample(page);
      if (s?.state !== "in" || s.opacity <= 0.5) continue;
      // The scene is to the right of the copy; a bubble must not land on
      // the headline.
      const overlapsHeading =
        s.left < heading!.x + heading!.width &&
        s.right > heading!.x &&
        s.top < heading!.y + heading!.height &&
        s.bottom > heading!.y;
      expect(overlapsHeading, `bubble overlapped the headline at ${s.left},${s.top}`).toBe(false);
    }
  });

  test("reduced motion does not run the bubble cycle", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(4000);
    const s = await sample(page);
    // The element may exist, but it must never be animated into view.
    expect(s?.state).toBe("out");
  });
});

for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  test(`capture a visible bubble at ${name}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Wait for a cycle where the bubble is actually up, so the capture
    // shows the thing being claimed rather than the gap between bubbles.
    for (let i = 0; i < 12; i++) {
      const s = await sample(page);
      if (s?.state === "in" && s.opacity > 0.9) break;
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `e2e-screens/hero-bubble-${name}.png` });
  });
}
