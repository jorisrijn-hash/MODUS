import { defineConfig, devices } from "@playwright/test";

// Points at an already-running `npm run dev` on :3000 rather than starting
// its own server — this project's dev server is frequently shared with
// other concurrent Claude Code sessions/agents working in the same repo,
// so a second server on the same port causes collisions (see
// BRIEF_CHECKLIST.md history). Start it yourself before running tests.
export default defineConfig({
  // Serial. Not the default per-core count.
  //
  // The homepage and the diagnostic each hold a WebGL context now, so a
  // high worker count runs several GPU-backed browsers at once on one
  // machine and the diagnostic flow intermittently times out. The specs
  // pass individually; this is contention, not a product defect — but a
  // suite that fails under its own parallelism is not a useful signal.
  workers: 1,
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    // Defaults to the local dev server. `MODUS_E2E_BASE_URL` points the
    // same specs at a deployment, which is how the account-isolation
    // checks are run against production after a release.
    baseURL: process.env.MODUS_E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
