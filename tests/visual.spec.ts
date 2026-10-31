import { expect, test } from "@playwright/test";

// Baselines are Linux screenshots generated and compared in CI, inside the
// Playwright container, so fonts and rendering never differ between machines.
// Locally these tests are skipped instead of passing without comparing. Set
// PLAYWRIGHT_VISUAL=1 to run them anyway (for example inside that container).
test.skip(
  !process.env.CI && !process.env.PLAYWRIGHT_VISUAL,
  "Visual baselines are generated and compared on Linux CI",
);

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`@visual home page in ${colorScheme} mode`, () => {
    test.use({ colorScheme, viewport: { width: 1280, height: 720 } });

    test("matches the baseline screenshot", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      // Wait for the session actions so the skeletons are not captured.
      await expect(page.locator("main [role='status']")).toHaveCount(0);

      await expect(page).toHaveScreenshot(
        ["visual", `home-${colorScheme}.png`],
        {
          fullPage: true,
        },
      );
    });
  });
}
