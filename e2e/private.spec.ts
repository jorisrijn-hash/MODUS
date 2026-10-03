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
    /*
     * Not asserted on status alone. The dev server answers 404 here, but
     * production renders the not-found PAGE for a POST to a path with no
     * handler and serves it with status 200 — which read as "the password
     * endpoint still works" when it does not. What matters is that no
     * handler ran: no session cookie is issued and the response is the
     * not-found page.
     */
    const body = await post.text();
    const noHandler = post.status() === 404 || /could not be found/i.test(body);
    expect(noHandler, `the password endpoint should have no handler (status ${post.status()})`).toBe(true);
    const cookies = post.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie");
    expect(
      cookies.some((c) => /modus_private_session/i.test(c.value)),
      "it must never issue a session"
    ).toBe(false);
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
