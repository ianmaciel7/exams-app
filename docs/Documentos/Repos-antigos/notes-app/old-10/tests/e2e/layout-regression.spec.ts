import { expect, test } from "@playwright/test";
import { createObject, createSpace, signUp } from "./helpers";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

test("all primary authenticated screens fit mobile and desktop viewports", async ({
  page,
}) => {
  // 12 routes (6 x 2 viewports), each now doing a pixel-diff screenshot on
  // top of the pre-existing checks, comfortably exceeds the 30s default.
  test.setTimeout(120_000);
  await signUp(page);
  await createSpace(page, "Responsive");
  const id = await createObject(page, {
    kind: "note",
    title: "Responsive note",
    text: "Layout regression target.",
  });

  // `slug` names the baseline PNG. It must stay stable across runs, so routes
  // whose path embeds a generated id (the question detail route below) use a
  // fixed slug instead of deriving one from `path`.
  const routes = [
    { path: "/space", heading: "Overview", slug: "space" },
    { path: "/question", heading: "Questions", slug: "question-list" },
    {
      path: `/question/${id}`,
      heading: "Responsive note",
      slug: "question-detail",
    },
    { path: "/study", heading: "Study session", slug: "study" },
    { path: "/review", heading: "Review queue", slug: "review" },
    { path: "/settings", heading: "Settings", slug: "settings" },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route.path);
      await expect(
        page.getByRole("heading", { name: route.heading, exact: true }).first(),
      ).toBeVisible();

      const metrics = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(
        Math.max(metrics.document, metrics.body),
        `${viewport.name} overflow on ${route.path}`,
      ).toBeLessThanOrEqual(metrics.viewport + 1);

      const screenshot = await page.screenshot();
      expect(
        screenshot.byteLength,
        `${viewport.name} screenshot for ${route.path} should not be blank`,
      ).toBeGreaterThan(5_000);
      expect(screenshot.readUInt32BE(16)).toBe(viewport.width);
      expect(screenshot.readUInt32BE(20)).toBe(viewport.height);

      // Pixel-diff baseline. The object detail card renders "Updated
      // <today's date>" (src/components/recall/object-detail.tsx), which
      // moves every day the suite runs; mask it so the comparison only ever
      // catches real layout drift. The mask locator is a no-op on routes
      // where it does not match anything.
      await expect(page).toHaveScreenshot(
        `${viewport.name}-${route.slug}.png`,
        {
          maxDiffPixelRatio: 0.02,
          mask: [page.getByText(/^Updated /)],
        },
      );
    }
  }
});

test("the public landing page fits both breakpoints", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Make your knowledge work together." }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${viewport.name} landing overflow`).toBeLessThanOrEqual(
      1,
    );

    await expect(page).toHaveScreenshot(`${viewport.name}-root.png`, {
      maxDiffPixelRatio: 0.02,
    });
  }
});

// NOTE ON BASELINES: `./layout-regression.spec.ts-snapshots/` is generated
// by `playwright test tests/e2e/layout-regression.spec.ts --update-snapshots`
// and is gitignored (see .gitignore), not committed. Playwright encodes the
// OS/renderer into each filename (e.g. `*-chromium-win32.png` on this
// Windows dev machine vs `*-chromium-linux.png` on CI's ubuntu-latest
// runner), so a baseline generated on one OS never matches, or is even
// looked up, on another. Until CI has its own step to generate and cache/
// commit Linux baselines, this spec's toHaveScreenshot() assertions only
// give real pixel-diff protection when run locally, right after
// regenerating baselines on the machine that will re-run them.
