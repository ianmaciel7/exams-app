import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

for (const envFile of [".env.local", ".env"]) {
  if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
    break;
  }
}

const authEmulator =
  process.env.PLAYWRIGHT_AUTH_EMULATOR === "true" ||
  process.argv.includes("--project=auth-emulator");
if (authEmulator) process.env.PLAYWRIGHT_AUTH_EMULATOR = "true";

const authEmulatorEndpoint = (
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ||
  "127.0.0.1:9099"
).replace(/^https?:\/\//, "");
const authTestHost = new URL(`http://${authEmulatorEndpoint}`).hostname;
const authTestBaseUrl = `http://${authTestHost}:3100`;

export default defineConfig({
  testDir: "./tests",
  testMatch: authEmulator ? "**/firebase-auth.spec.ts" : "**/*.spec.ts",
  testIgnore: authEmulator ? undefined : "**/firebase-auth.spec.ts",
  fullyParallel: !authEmulator,
  forbidOnly: Boolean(process.env.CI),
  // A retry passing does not erase the original failure.
  failOnFlakyTests: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Hosted runners have 2 vCPUs; more workers only add flakiness.
  workers: authEmulator ? 1 : process.env.CI ? 2 : undefined,
  timeout: 30_000,
  // Keeps a hung run well below the 20-minute job limit in CI.
  globalTimeout: process.env.CI ? 12 * 60_000 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  expect: {
    // Visual baselines are committed per platform (`-chromium-win32.png`).
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  snapshotPathTemplate:
    "{testDir}/snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}",
  use: {
    baseURL: authEmulator ? authTestBaseUrl : "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: authEmulator
    ? [{ name: "auth-emulator", use: { ...devices["Desktop Chrome"] } }]
    : [
        {
          name: "chromium",
          testIgnore: ["**/firebase-auth.spec.ts", "**/mobile.spec.ts"],
          use: { ...devices["Desktop Chrome"] },
        },
        {
          // Real mobile emulation (isMobile, hasTouch, coarse pointer), not a
          // narrow desktop window. Pixel 7 runs on the Chromium binary.
          name: "mobile",
          testMatch: "**/mobile.spec.ts",
          use: { ...devices["Pixel 7"] },
        },
      ],
  webServer: authEmulator
    ? {
        command: `pnpm dev --hostname ${authTestHost} --port 3100`,
        env: {
          NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST:
            process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST ||
            process.env.FUNCTIONS_EMULATOR_HOST ||
            "127.0.0.1:5001",
        },
        url: authTestBaseUrl,
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : {
        command: "pnpm build && pnpm start",
        reuseExistingServer: !process.env.CI,
        // This budget includes the production build, not just server startup.
        timeout: 300_000,
        stdout: "pipe",
        url: "http://127.0.0.1:3000",
      },
});
