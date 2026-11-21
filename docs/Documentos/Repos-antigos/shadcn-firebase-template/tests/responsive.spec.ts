import { expect, type Locator, type Page, test } from "@playwright/test";

const viewports = [
  { name: "reflow-320", width: 320, height: 568 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 800 },
];

const routes = ["/", "/sign-in", "/register"];

async function assertTouchTargetSize(target: Locator) {
  if (!(await target.isVisible())) return;
  const box = await target.boundingBox();
  if (!box || box.width <= 0 || box.height <= 0) return;

  expect(box.width).toBeGreaterThanOrEqual(23.5);
  expect(box.height).toBeGreaterThanOrEqual(23.5);
}

async function waitForInteractiveUi(page: Page, route: string) {
  if (route === "/") {
    await expect(page.locator('a[href="/register"]')).toBeVisible();
    return;
  }

  // The CI runner may intentionally lack Firebase configuration.
  await expect(
    page.locator("main input, main [role='alert']").first(),
  ).toBeVisible();
  if (await page.locator("main [role='alert']").isVisible()) {
    test.skip(true, "Auth controls require Firebase configuration");
  }
}

test.describe("responsiveness and reflow suite", () => {
  for (const { name: viewportName, width, height } of viewports) {
    test.describe(`viewport ${viewportName} (${width}x${height})`, () => {
      test.use({ viewport: { width, height } });

      for (const route of routes) {
        test(`prevents horizontal overflow on ${route} (WCAG 1.4.10 Reflow)`, async ({
          page,
        }) => {
          await page.goto(route);
          await expect(page.locator("main")).toBeVisible();

          const fitsWithoutHorizontalScroll = await page.evaluate(() => {
            return (
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth + 1
            );
          });

          expect(fitsWithoutHorizontalScroll).toBe(true);
        });

        test(`satisfies WCAG 2.2 SC 2.5.8 Touch Target size on ${route}`, async ({
          page,
        }) => {
          await page.goto(route);
          await expect(page.locator("main")).toBeVisible();

          await waitForInteractiveUi(page, route);

          const targets = await page
            .locator("button, a, [role='button'], [role='link']")
            .all();
          expect(targets.length).toBeGreaterThan(0);

          for (const target of targets) {
            await assertTouchTargetSize(target);
          }
        });
      }
    });
  }

  test("reflows home hero action buttons between mobile and desktop", async ({
    page,
  }) => {
    // 1. Mobile reflow: action buttons stack vertically full-width
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();

    const signInLink = page.locator('a[href="/sign-in"]');
    const getStartedLink = page.locator('a[href="/register"]');

    await expect(signInLink).toBeVisible();
    await expect(getStartedLink).toBeVisible();

    const mobileSignIn = await signInLink.boundingBox();
    const mobileGetStarted = await getStartedLink.boundingBox();

    expect(mobileSignIn).not.toBeNull();
    expect(mobileGetStarted).not.toBeNull();

    if (mobileSignIn && mobileGetStarted) {
      expect(mobileGetStarted.y).toBeGreaterThanOrEqual(
        mobileSignIn.y + mobileSignIn.height - 1,
      );
      expect(mobileSignIn.width).toBeGreaterThan(250);
      expect(mobileGetStarted.width).toBeGreaterThan(250);
    }

    // 2. Desktop reflow: action buttons align horizontally side-by-side
    await page.setViewportSize({ width: 1280, height: 800 });

    const desktopSignIn = await signInLink.boundingBox();
    const desktopGetStarted = await getStartedLink.boundingBox();

    expect(desktopSignIn).not.toBeNull();
    expect(desktopGetStarted).not.toBeNull();

    if (desktopSignIn && desktopGetStarted) {
      expect(Math.abs(desktopSignIn.y - desktopGetStarted.y)).toBeLessThan(5);
      expect(desktopGetStarted.x).toBeGreaterThanOrEqual(
        desktopSignIn.x + desktopSignIn.width - 1,
      );
      expect(desktopSignIn.width).toBeLessThanOrEqual(165);
      expect(desktopGetStarted.width).toBeLessThanOrEqual(165);
    }
  });
});
