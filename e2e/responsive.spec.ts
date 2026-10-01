import { test } from "@playwright/test";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  largeDesktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

const PAGES = {
  home: "/",
  pricing: "/pricing",
  diagnostic: "/diagnostic",
  privateLogin: "/private/login",
};

// Screenshots land in e2e-artifacts/ (gitignored) purely for visual QA
// during this session — not a golden-image regression suite, and not
// meant to be committed or kept around afterward.
for (const [pageName, path] of Object.entries(PAGES)) {
  for (const [viewportName, size] of Object.entries(VIEWPORTS)) {
    test(`${pageName} @ ${viewportName}`, async ({ page }) => {
      // Reduced motion skips the multi-second Loader intro so it doesn't
      // sit in every single screenshot, and doubles as the "does
      // reduced-motion actually work" check from the test plan.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(size);
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // whileInView reveals only fire once their section has actually
      // intersected the viewport — a plain fullPage screenshot resizes the
      // capture instead of scrolling it, so below-the-fold content never
      // triggers and the shot comes back blank even though real (scrolling)
      // visitors see it fine. Known false negative from earlier in this
      // project. Fix: grow the viewport to the page's full scroll height
      // first, so every section is simultaneously "in view" before the
      // screenshot is taken.
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > size.width + 1) {
        throw new Error(`${pageName} @ ${viewportName}: horizontal overflow (${scrollWidth}px > ${size.width}px)`);
      }
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width: size.width, height: scrollHeight });
      await page.waitForTimeout(300);

      await page.screenshot({
        path: `e2e-artifacts/${pageName}-${viewportName}.png`,
        fullPage: true,
      });
    });
  }
}
