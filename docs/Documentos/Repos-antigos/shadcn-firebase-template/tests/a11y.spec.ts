import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// axe-core tags: WCAG 2.0, 2.1 and 2.2 Level A/AA. WCAG 2.2 adds no new
// Level A tag of its own, only "wcag22aa". Automated scans find only a subset
// of issues; keyboard and screen-reader behavior still need manual review.
const standards = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const viewports = [
  { name: "desktop", viewport: { width: 1280, height: 800 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
];

for (const { name: viewportName, viewport } of viewports) {
  for (const colorScheme of ["light", "dark"] as const) {
    test.describe(`@a11y home page in ${colorScheme} mode (${viewportName})`, () => {
      test.use({ colorScheme, viewport });

      test("has no automatically detectable WCAG A/AA violations", async ({
        page,
      }) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        const results = await new AxeBuilder({ page })
          .withTags(standards)
          .analyze();

        expect(results.violations).toEqual([]);
      });
    });
  }
}
