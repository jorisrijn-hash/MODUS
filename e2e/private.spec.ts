import { test, expect } from "@playwright/test";

// The "valid credentials" test needs the .env admin password to be
// temporarily swapped to a known value (and restored immediately after —
// never left in place) and that plaintext passed in via E2E_ADMIN_PASSWORD,
// e.g.: E2E_ADMIN_PASSWORD='TestVerify123!' npx playwright test private.spec.ts
// Skipped by default so a routine `npx playwright test` run doesn't fail
// against the real production password. Only ONE bad-credential attempt is
// made per run either way: the login endpoint rate-limits at 5 failures per
// 15 minutes per IP, and this suite must never be the thing that locks out
// a real admin session.
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe("private admin auth", () => {
  test("unauthenticated visitor is redirected away from /private", async ({ page }) => {
    await page.goto("/private");
    await expect(page).toHaveURL(/\/private\/login/);
  });

  test("wrong credentials show an error and do not redirect", async ({ page }) => {
    await page.goto("/private/login");
    await page.getByLabel("Username").fill("admin");
    await page.getByLabel("Password").fill("definitely-wrong-password");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/private\/login/);
  });

  test("valid credentials sign in, and logout invalidates the session", async ({ page }) => {
    test.skip(!ADMIN_PASSWORD, "set E2E_ADMIN_PASSWORD to the temporarily-swapped .env password to run this");
    const errors: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));

    await page.goto("/private/login");
    await page.getByLabel("Username").fill("admin");
    await page.getByLabel("Password").fill(ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/private$/, { timeout: 5000 });

    // Basic nav around the authenticated app
    await page.getByRole("link", { name: "Diagnostics" }).click();
    await expect(page).toHaveURL(/\/private\/diagnostics/);
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/private\/settings/);

    // Sign out via the account menu, then confirm the session is really gone
    await page.getByLabel("Account menu").click();
    await page.getByRole("button", { name: /Sign Out/i }).click();
    await expect(page).toHaveURL(/\/private\/login/, { timeout: 5000 });

    await page.goto("/private");
    await expect(page).toHaveURL(/\/private\/login/);

    expect(errors, `console errors during admin flow:\n${errors.join("\n")}`).toEqual([]);
  });

  test("private API routes reject unauthenticated requests", async ({ request }) => {
    const res = await request.get("/api/private/diagnostics");
    expect(res.status()).toBe(401);
  });
});

/**
 * Admin-surface rejection, covered without the password.
 *
 * The "valid credentials" test above is skipped by default because it
 * needs the real admin password swapped in, so on a routine run nothing
 * asserted that the admin surface is closed. These do, and they need no
 * secret: every private page redirects an anonymous visitor to the login,
 * and every private API answers 401 rather than 500 or, worse, data.
 *
 * NOTE ON SCOPE: this covers the mechanism that is actually wired. The
 * Clerk admin path — `requireAdminSession`, `isAdmin` and the
 * `AdminMember` table — is implemented and unit-tested in
 * `src/lib/auth/__tests__/authorize.test.ts`, but no route calls it yet,
 * so there is no Clerk-gated admin surface to drive from a browser. See
 * PROJECT-STATUS.md. When /private moves onto Clerk, the signed-in and
 * revoked cases belong here.
 */
test.describe("admin surface is closed to anonymous callers", () => {
  const pages = ["/private", "/private/diagnostics", "/private/pipeline", "/private/settings"];
  for (const path of pages) {
    test(`${path} redirects an anonymous visitor to the login`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), `${path} should redirect, not render`).toBe(307);
      expect(res.headers()["location"]).toContain("/private/login");
    });
  }

  const apis = [
    "/api/private/diagnostics",
    "/api/private/overview",
    "/api/private/diagnostics/export",
  ];
  for (const path of apis) {
    test(`${path} answers 401 to an anonymous caller`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should be unauthorized`).toBe(401);
      const body = await res.text();
      // A 401 that still ships rows would be worse than a 500.
      expect(body).not.toMatch(/companyName|firstName|"email"/i);
    });
  }
});
