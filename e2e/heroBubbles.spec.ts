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
  /*
   * These watch several ~5s bubble cycles, so they are slow by nature.
   * Against a deployment the context teardown then overran a 60s budget
   * and reported a failure although every assertion had passed — the
   * error was "Tearing down context exceeded the test timeout", not an
   * assertion. The budget covers the sampling plus teardown now.
   */
  test.setTimeout(120_000);

  test("appear on screen, inside the hero, and are never clipped away", async ({ page }) => {
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
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    /*
     * Observed from INSIDE the page, not sampled from Node.
     *
     * Polling with repeated `page.evaluate` worked locally but failed
     * against the deployment: each round trip costs network latency, so
     * the sampler kept missing the ~3s window in which a bubble is
     * actually up. A probe confirmed production rotates correctly —
     * "Friction detected" → "Workflow connected" → "Progress reviewed" —
     * so the fault was in how the test watched, not in what it watched.
     *
     * A MutationObserver records every label the element ever shows,
     * which cannot miss one however slow the connection is.
     */
    await page.evaluate(() => {
      const w = window as unknown as { __bubbleLabels?: Set<string> };
      w.__bubbleLabels = new Set<string>();
      const el = document.querySelector('div[data-state][aria-hidden="true"]');
      if (!el) return;
      const record = () => {
        const node = el as HTMLElement;
        if (node.dataset.state === "in") {
          const text = node.textContent?.trim();
          if (text) w.__bubbleLabels!.add(text);
        }
      };
      record();
      new MutationObserver(record).observe(el, {
        attributes: true,
        attributeFilter: ["data-state"],
        childList: true,
        subtree: true,
        characterData: true,
      });
    });

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => (window as unknown as { __bubbleLabels?: Set<string> }).__bubbleLabels?.size ?? 0
          ),
        { timeout: 45_000, intervals: [1000] }
      )
      .toBeGreaterThan(1);
  });

  test("they sit over the scene, not over the headline column", async ({ page }) => {
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
