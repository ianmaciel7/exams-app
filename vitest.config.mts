import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Discover the dialog's dependencies before any browser test renders React.
    include: [
      "react",
      "react-dom/client",
      "react/jsx-runtime",
      "vitest-browser-react",
      "@base-ui/react/form",
      "@base-ui/react/field",
      "@base-ui/react/toast",
      "next-intl",
    ],
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json", "json-summary"],
      // Report every source file. Keep the established 70% gate on application
      // runtime code; copied libraries have separate, visible coverage totals.
      thresholds: {
        "src/{app,hooks,lib,i18n,components/ui/extensions,components/firebase}/**/*.{ts,tsx}":
          {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
          },
      },
      include: ["src/**/*.{ts,tsx}"],
    },
    projects: [
      {
        test: {
          name: "unit",
          // Match the server graph's marker resolution only in unit tests.
          alias: {
            "server-only": fileURLToPath(
              new URL(
                "./node_modules/next/dist/compiled/server-only/empty.js",
                import.meta.url,
              ),
            ),
          },
          environment: "jsdom",
          testTimeout: 30000,
          include: [
            "src/**/*.test.{ts,tsx}",
            ".biome/**/*.test.ts",
            ".ast-grep/**/*.test.ts",
          ],
          exclude: ["src/**/*.browser.test.{ts,tsx}"],
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.{ts,tsx}"],
          api: {
            host: "127.0.0.1",
            port: 4174,
          },
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
