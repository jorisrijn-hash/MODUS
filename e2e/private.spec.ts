import { test, expect } from "@playwright/test";

/**
 * The admin surface is gated on Clerk identity plus a current, unrevoked
 * `AdminMember` row. The shared-password login it replaced is gone — the
 * form, its API route and the session module are deleted, not disabled,
 * so there is no second way in to drift out of sync with this one.
 *
 * The old "valid credentials sign in" test went with it. Driving a real
 * Google/Clerk sign-in from Playwright needs Clerk's own test tooling and
 * live credentials, so the signed-in cases are covered server-side
 * instead, against the real route handlers, in
 * `src/lib/auth/__tests__/privateRoutes.test.ts`: anonymous denied,
 * ordinary account denied, active admin admitted, revoked admin denied on
 * the very next request, and the notes route closed to customers.
 *
 * What remains here is what a browser can actually assert without a
 * secret, and it now runs on every routine pass rather than being skipped
 * by default.
 */

test.describe("admin surface is closed to anonymous callers", () => {
  test("the password login is gone and sends visitors to Clerk", async ({ request }) => {
    const res = await request.get("/private/login", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toContain("/sign-in");
    // The endpoint that used to accept a password must not answer at all.
    const post = await request.post("/api/private/login", {
      data: { username: "admin", password: "anything" },
      failOnStatusCode: false,
    });
    // 404, not 405: the route file is deleted, so there is no handler of
    // any method left to reach.
    expect(post.status(), "the password endpoint should no longer exist").toBe(404);
  });

  const pages = ["/private", "/private/diagnostics", "/private/pipeline", "/private/settings"];
  for (const path of pages) {
    test(`${path} redirects an anonymous visitor to the login`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), `${path} should redirect, not render`).toBe(307);
      // To Clerk, not to a MODUS password form.
      expect(res.headers()["location"]).toContain("/sign-in");
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
