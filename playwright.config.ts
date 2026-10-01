import { defineConfig, devices } from "@playwright/test";

// Points at an already-running `npm run dev` on :3000 rather than starting
// its own server — this project's dev server is frequently shared with
// other concurrent Claude Code sessions/agents working in the same repo,
// so a second server on the same port causes collisions (see
// BRIEF_CHECKLIST.md history). Start it yourself before running tests.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
