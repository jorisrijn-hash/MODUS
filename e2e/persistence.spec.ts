import { test, expect } from "@playwright/test";

/**
 * Backend persistence guarantees, exercised against the real API and the
 * real database — not a mocked fetch.
 */

/** Matches the real submissionSchema in src/app/api/diagnostic/route.ts. */
const BASE = {
  companyName: "Idempotency BV",
  industry: "Retail",
  employees: "11-50",
  locations: "1",
  reachChannels: ["Website"],
  enquiryHandling: ["Email"],
  adminHours: "10-20",
  processStandardization: 3,
  dependency: "Medium",
  systems: ["CRM"],
  connectionLevel: "Partly",
  spreadsheetDependency: "Some",
  automationUsage: ["None"],
  friction: ["Admin"],
  frequency: "Daily",
  impact: ["Time"],
  priorities: ["Efficiency"],
  timing: "Next quarter",
  firstName: "Ida",
  lastName: "Key",
  phone: "+31612345678",
  privacyConsent: true,
  preliminaryProfile: [],
  preliminarySignals: [],
};

test("a retried submission with the same idempotency key creates one record", async ({
  request,
}) => {
  const key = `pw-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const payload = { ...BASE, email: `idem.${key}@playwright-qa.dev` };

  const first = await request.post("/api/diagnostic", {
    headers: { "Idempotency-Key": key },
    data: payload,
  });
  expect(first.ok()).toBeTruthy();
  const a = await first.json();
  expect(a.id).toBeTruthy();

  // Same key again — the shape a double-click or a retry after a timeout
  // produces.
  const second = await request.post("/api/diagnostic", {
    headers: { "Idempotency-Key": key },
    data: payload,
  });
  expect(second.ok()).toBeTruthy();
  const b = await second.json();

  expect(b.id).toBe(a.id);
  expect(b.deduplicated).toBe(true);
  // The context token must survive the retry, or the visitor's stored
  // profile reference would break on the second attempt.
  expect(b.contextToken).toBe(a.contextToken);
});

test("a submission without an idempotency key still persists", async ({ request }) => {
  const res = await request.post("/api/diagnostic", {
    data: { ...BASE, email: `nokey.${Date.now()}@playwright-qa.dev` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.id).toBeTruthy();
  expect(body.deduplicated).toBeUndefined();
});

test("the admin inbox is not reachable without authentication", async ({ request }) => {
  // Protected independently of the UI: a direct request must not return
  // submission data.
  for (const path of ["/private", "/private/diagnostics", "/api/private/diagnostics"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(
      res.status() === 401 || res.status() === 403 || (res.status() >= 300 && res.status() < 400),
      `${path} returned ${res.status()} — expected auth rejection or redirect`
    ).toBeTruthy();
  }
});
