import { defineConfig, devices } from "@playwright/test";

// Tests share one emulator instance and sign in as real users, so they run
// serially — parallel workers would race on the session cookie and on each
// other's Space membership.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Turbopack compiles each route on its first real request. /login is
    // warmed by the webServer health check below, but the first route a spec
    // navigates to past that (typically /space, right after sign-up) is not,
    // and a cold compile can outrun the 30s default on a slow machine.
    navigationTimeout: 60_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm run emulators",
      url: "http://127.0.0.1:8080",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
    },
    {
      command: "pnpm dev",
      url: "http://localhost:3000/login",
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
    },
  ],
});
