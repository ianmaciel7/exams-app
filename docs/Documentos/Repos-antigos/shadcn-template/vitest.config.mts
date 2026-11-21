import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json", "json-summary"],
      // Baseline just below the template's current coverage (about 74%). Raise
      // it as application code grows; never lower it to make a run pass.
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,browser.test,stories}.{ts,tsx}",
        "src/components/ai-elements/**",
        "src/components/ui/*.tsx",
        "src/types/**",
      ],
    },
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}", ".biome/**/*.test.ts"],
          exclude: ["src/**/*.browser.test.{ts,tsx}"],
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.{ts,tsx}"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
