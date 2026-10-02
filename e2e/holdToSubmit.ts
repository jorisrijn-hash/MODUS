import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Press and hold a hold-to-confirm control past its threshold.
 *
 * This exists because the hand-rolled version of it — measure
 * `boundingBox()`, then `mouse.move` to the centre — was the cause of a
 * long-standing intermittent failure in the diagnostic submit specs, which
 * always surfaced as a confusing 15s timeout on a later assertion about the
 * estimate screen rather than as anything to do with the button.
 *
 * The review screen animates in. Traced against the real app, the button's
 * `box.y` moves 619 -> 603 between t=300ms and t=600ms after the screen
 * becomes visible (`scrollY` is constant throughout, so this is the
 * entrance animation, not scrolling). The old code measured at t~=0, the
 * instant `toBeVisible()` resolved, then pressed at those now-stale
 * coordinates: a 16px drift against a 53px-tall button left ~11px of
 * slack, so it usually landed and occasionally did not. Under CPU
 * contention — the whole suite runs `workers: 1` precisely because these
 * pages hold WebGL contexts — it did not.
 *
 * When the press missed, it landed on the page behind the button. Nothing
 * threw: no hold started, no submission happened, and the test sat waiting
 * for a screen that could never arrive. Three of the five call sites also
 * wrapped the press in `if (box)`, so a null box skipped the hold silently
 * and produced that same timeout.
 *
 * `hover()` removes the race rather than widening the margin: Playwright's
 * actionability check waits for the element to be visible, enabled,
 * receiving events, and *stable* (an unchanged bounding box across two
 * consecutive animation frames) before it positions the pointer. There is
 * no coordinate for the animation to invalidate.
 */
export async function holdToSubmit(page: Page, button: Locator, holdMs = 1800) {
  await expect(button).toBeVisible();
  // Waits for the entrance animation to settle, then parks the pointer on
  // the element's centre.
  await button.hover();
  await page.mouse.down();
  // The pointer must not move while held: the control cancels on
  // pointer-out.
  await page.waitForTimeout(holdMs);
  await page.mouse.up();
}
