# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authTransition.spec.ts >> sign-in and sign-up share one shell >> the mark survives the navigation instead of being re-created
- Location: e2e/authTransition.spec.ts:33:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - link "MODUS home" [ref=e4] [cursor=pointer]:
        - /url: /
      - generic [ref=e11]:
        - heading "Sign in to MODUS." [level=1] [ref=e12]
        - paragraph [ref=e13]: Pick up your diagnostic where you left it.
      - generic [ref=e16]:
        - generic [ref=e18]:
          - generic [ref=e20]:
            - button "GitHub" [ref=e21] [cursor=pointer]
            - button "Google" [ref=e26] [cursor=pointer]
          - paragraph [ref=e33]: or
          - generic [ref=e35]:
            - generic [ref=e36]:
              - generic [ref=e39]:
                - generic [ref=e40]: Email address or username
                - textbox "Email address or username" [ref=e42]:
                  - /placeholder: Enter email or username
              - generic:
                - generic: Password
                - generic:
                  - textbox:
                    - /placeholder: Enter your password
                  - button
            - button "Continue" [ref=e45] [cursor=pointer]
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]: Don’t have an account?
            - link "Sign up" [ref=e52] [cursor=pointer]:
              - /url: https://www.withmodus.co/sign-up
          - generic [ref=e56]:
            - paragraph [ref=e57]: Secured by
            - link "Clerk logo" [ref=e58] [cursor=pointer]:
              - /url: https://go.clerk.com/components
      - paragraph [ref=e64]:
        - text: New here?
        - link "Create an account" [ref=e65] [cursor=pointer]:
          - /url: /sign-up
        - text: . You can also
        - link "run a diagnostic as a guest" [ref=e66] [cursor=pointer]:
          - /url: /diagnostic
        - text: .
  - dialog "Privacy / Preferences" [ref=e67]:
    - generic [ref=e68]:
      - generic [ref=e69]: Privacy / Preferences
      - generic [ref=e74]:
        - paragraph [ref=e75]: MODUS uses necessary technologies to operate this website. Optional analytics help us understand how the site is used, and only run once you allow them.
        - generic [ref=e76]:
          - button "Accept All" [ref=e77] [cursor=pointer]
          - button "Reject Optional" [ref=e78] [cursor=pointer]
          - button "Manage" [ref=e79] [cursor=pointer]
  - alert [ref=e80]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * The transition between the two auth screens.
  5   |  *
  6   |  * The brief asks for a morph, not a page fade: the mark, the heading
  7   |  * block and the form surface should transition in place. "Looks animated"
  8   |  * is not testable, but the thing that makes it a morph rather than a
  9   |  * crossfade is — the shared elements must be the SAME DOM nodes before
  10  |  * and after, never unmounted and recreated.
  11  |  */
  12  | 
  13  | const SHOTS = "e2e-screens";
  14  | 
  15  | async function settle(page: Page) {
  16  |   await page.waitForLoadState("networkidle");
  17  |   await page.locator(".cl-formButtonPrimary, form").first().waitFor({ timeout: 20_000 }).catch(() => {});
> 18  |   await page.waitForTimeout(700);
      |              ^ Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
  19  | }
  20  | 
  21  | /** Tags a node so we can tell afterwards whether it survived. */
  22  | async function tag(page: Page, selector: string, value: string) {
  23  |   await page.locator(selector).first().evaluate((el, v) => ((el as HTMLElement & { __tag?: string }).__tag = v), value);
  24  | }
  25  | async function stillTagged(page: Page, selector: string, value: string) {
  26  |   return page
  27  |     .locator(selector)
  28  |     .first()
  29  |     .evaluate((el, v) => (el as HTMLElement & { __tag?: string }).__tag === v, value);
  30  | }
  31  | 
  32  | test.describe("sign-in and sign-up share one shell", () => {
  33  |   test("the mark survives the navigation instead of being re-created", async ({ page }) => {
  34  |     await page.goto("/sign-in");
  35  |     await settle(page);
  36  |     await tag(page, '[aria-label="MODUS home"]', "shared-mark");
  37  | 
  38  |     await page.getByRole("link", { name: /Create an account/i }).click();
  39  |     await expect(page).toHaveURL(/\/sign-up/);
  40  |     await settle(page);
  41  | 
  42  |     // The same node, still carrying the tag: it was never unmounted, so
  43  |     // it can transition in place rather than fade out and back in.
  44  |     expect(await stillTagged(page, '[aria-label="MODUS home"]', "shared-mark")).toBe(true);
  45  |   });
  46  | 
  47  |   test("the copy actually changes with the route", async ({ page }) => {
  48  |     await page.goto("/sign-in");
  49  |     await settle(page);
  50  |     await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Sign in to MODUS/i);
  51  | 
  52  |     await page.getByRole("link", { name: /Create an account/i }).click();
  53  |     await settle(page);
  54  |     await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Create your MODUS account/i);
  55  |     await expect(page.getByText(/Save your progress and return with a clearer picture/i)).toBeVisible();
  56  |   });
  57  | 
  58  |   test("real URLs and working browser Back", async ({ page }) => {
  59  |     await page.goto("/sign-in");
  60  |     await settle(page);
  61  |     await page.getByRole("link", { name: /Create an account/i }).click();
  62  |     await expect(page).toHaveURL(/\/sign-up$/);
  63  |     await settle(page);
  64  | 
  65  |     await page.goBack();
  66  |     await expect(page).toHaveURL(/\/sign-in$/);
  67  |     await settle(page);
  68  |     await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Sign in to MODUS/i);
  69  |     // Clerk's own form is still functional after the morph, not a husk.
  70  |     await expect(page.locator(".cl-formButtonPrimary").first()).toBeVisible();
  71  |   });
  72  | 
  73  |   test("the form stays readable and operable throughout", async ({ page }) => {
  74  |     await page.goto("/sign-up");
  75  |     await settle(page);
  76  |     const primary = page.locator(".cl-formButtonPrimary").first();
  77  |     const paint = await primary.evaluate((el) => {
  78  |       const c = getComputedStyle(el);
  79  |       return { bg: c.backgroundColor, color: c.color, opacity: c.opacity, visibility: c.visibility };
  80  |     });
  81  |     expect(paint.bg).toBe("rgb(30, 59, 46)");
  82  |     expect(paint.color).toBe("rgb(255, 255, 255)");
  83  |     expect(paint.visibility).toBe("visible");
  84  |     expect(Number(paint.opacity)).toBeGreaterThan(0.9);
  85  |   });
  86  | 
  87  |   test("keyboard focus reaches the link and shows a visible ring", async ({ page }) => {
  88  |     await page.goto("/sign-in");
  89  |     await settle(page);
  90  |     const link = page.getByRole("link", { name: /Create an account/i });
  91  |     await link.focus();
  92  |     const outline = await link.evaluate((el) => {
  93  |       const s = getComputedStyle(el);
  94  |       return { style: s.outlineStyle, width: s.outlineWidth, shadow: s.boxShadow };
  95  |     });
  96  |     const visible = (outline.style !== "none" && outline.width !== "0px") || outline.shadow !== "none";
  97  |     expect(visible, `no focus ring: ${JSON.stringify(outline)}`).toBe(true);
  98  | 
  99  |     // Activating by keyboard navigates for real.
  100 |     await page.keyboard.press("Enter");
  101 |     await expect(page).toHaveURL(/\/sign-up/);
  102 |   });
  103 | 
  104 |   test("reduced motion still arrives at the same screen", async ({ page }) => {
  105 |     await page.emulateMedia({ reducedMotion: "reduce" });
  106 |     await page.goto("/sign-in");
  107 |     await settle(page);
  108 |     await page.getByRole("link", { name: /Create an account/i }).click();
  109 |     await expect(page).toHaveURL(/\/sign-up/);
  110 |     // No waiting on an animation: the destination is correct immediately.
  111 |     await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Create your MODUS account/i);
  112 |     await expect(page.locator(".cl-formButtonPrimary").first()).toBeVisible();
  113 |   });
  114 | });
  115 | 
  116 | for (const [name, viewport] of [
  117 |   ["desktop", { width: 1440, height: 900 }],
  118 |   ["mobile", { width: 390, height: 844 }],
```