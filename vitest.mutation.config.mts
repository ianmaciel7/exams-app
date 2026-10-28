import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Stryker re-runs the tests for every mutant, so it only uses the fast jsdom
// unit tests and leaves out the Browser Mode project from vitest.config.mts.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["src/**/*.browser.test.{ts,tsx}"],
  },
});
