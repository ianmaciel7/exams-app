import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import {
  assertLoadingFinished,
  assertLoadingTrace,
  installLoadingProbe,
  readLoadingTrace,
} from "./support/loading-motion";

// Runs in the `mobile` project: a Pixel 7 with isMobile and hasTouch, so the
// meta viewport is honored and `(pointer: coarse)` matches, unlike a desktop
// browser with a narrow window.

const standards = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const routes = ["/", "/sign-in", "/register", "/forgot-password"];
const authRoutes = new Set(["/sign-in", "/register", "/forgot-password"]);

// Apple HIG and WCAG 2.5.5 (AAA) recommend 44x44 CSS pixels for touch input.
const minTouchTarget = 44;
// iOS Safari zooms into any focused field whose font is smaller than 16px.
const minFieldFontSize = 16;

async function openRoute(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.ok()).toBe(true);
  await expect(page.locator("main")).toBeVisible();
  if (route === "/") {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // The hero is server-rendered; the actions follow the client session.
    await expect(page.locator("main [role='status']")).toHaveCount(0);
    return;
  }
  await expect(
    page.locator("main input, main [role='alert']").first(),
  ).toBeVisible();
  if (await page.locator("main [role='alert']").isVisible()) {
    test.skip(true, "Auth controls require Firebase configuration");
  }
}

function hasHorizontalOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
}

test("matches a coarse pointer, so touch-only styles are exercised", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
  ).toBe(true);
});

test("declares a device-width viewport that allows zoom and a theme color", async ({
  page,
}) => {
  await page.goto("/");
  const viewport = await page
    .locator('meta[name="viewport"]')
    .getAttribute("content");
  expect(viewport).toMatch(/width=device-width/);
  expect(viewport).toMatch(/initial-scale=1/);
  expect(viewport).not.toMatch(/user-scalable=(no|0)/);
  expect(viewport).not.toMatch(/maximum-scale=1(\.0)?(\D|$)/);
  await expect(page.locator('meta[name="theme-color"]').first()).toBeAttached();
  await expect(page.locator('link[rel="manifest"]')).toBeAttached();
});

for (const route of routes) {
  test.describe(`mobile ${route}`, () => {
    test("has no automatically detectable WCAG A/AA violations", async ({
      page,
    }) => {
      await openRoute(page, route);
      const results = await new AxeBuilder({ page })
        .withTags(standards)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("has exactly one level-one heading", async ({ page }) => {
      await openRoute(page, route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });

    test("fits portrait and landscape without horizontal scroll", async ({
      page,
    }) => {
      await openRoute(page, route);
      expect(await hasHorizontalOverflow(page)).toBe(false);

      const size = page.viewportSize();
      if (!size) throw new Error("The mobile project must set a viewport");
      await page.setViewportSize({ width: size.height, height: size.width });
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test("keeps content readable with WCAG 1.4.12 text spacing", async ({
      page,
    }) => {
      await openRoute(page, route);
      // A constructed stylesheet stands in for a user stylesheet: the nonce
      // CSP blocks the inline <style> that addStyleTag would inject.
      await page.evaluate((css) => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
      }, "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }");
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`gives touch targets at least ${minTouchTarget}x${minTouchTarget}px`, async ({
      page,
    }) => {
      await openRoute(page, route);
      const undersized = await page.evaluate((min) => {
        const selector =
          "button, a[href], input:not([type='hidden']), select, textarea, [role='button'], [role='link'], [role='checkbox'], [role='switch']";
        return [...document.querySelectorAll<HTMLElement>(selector)]
          .filter((element) => {
            // WCAG exempts links inside a sentence of text.
            if (getComputedStyle(element).display === "inline") return false;
            const box = element.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) return false;
            return box.width < min - 0.5 || box.height < min - 0.5;
          })
          .map((element) => {
            const box = element.getBoundingClientRect();
            const name =
              element.getAttribute("aria-label") ??
              element.textContent?.trim().slice(0, 40) ??
              element.tagName;
            return `${element.tagName.toLowerCase()} "${name}" ${Math.round(box.width)}x${Math.round(box.height)}`;
          });
      }, minTouchTarget);
      expect(undersized).toEqual([]);
    });

    test(`uses at least ${minFieldFontSize}px text in form fields`, async ({
      page,
    }) => {
      await openRoute(page, route);
      const size = page.viewportSize();
      if (!size) throw new Error("The mobile project must set a viewport");
      // Landscape phones cross the `md` breakpoint, where desktop styles
      // usually shrink field text.
      for (const viewport of [
        size,
        { width: size.height, height: size.width },
      ]) {
        await page.setViewportSize(viewport);
        const sizes = await page.evaluate(() =>
          [
            ...document.querySelectorAll<HTMLElement>(
              "input:not([type='hidden']):not([type='checkbox']):not([type='radio']), select, textarea",
            ),
          ].map((field) => ({
            field: field.id || field.getAttribute("name") || field.tagName,
            fontSize: Number.parseFloat(getComputedStyle(field).fontSize),
          })),
        );
        for (const { field, fontSize } of sizes) {
          expect(
            fontSize,
            `${field} font size at ${viewport.width}px`,
          ).toBeGreaterThanOrEqual(minFieldFontSize);
        }
      }
    });

    if (authRoutes.has(route)) {
      test("labels form fields for autofill and the right keyboard (WCAG 1.3.5)", async ({
        page,
      }) => {
        await openRoute(page, route);
        const fields = page.locator(
          "main input[type='email'], main input[type='password'], main input[type='tel']",
        );
        expect(await fields.count()).toBeGreaterThan(0);
        for (const field of await fields.all()) {
          await expect(field).toHaveAttribute(
            "autocomplete",
            /^(username|email|current-password|new-password|tel|tel-national)$/,
          );
        }
      });
    }
  });
}

test.describe("with the reduce motion preference", () => {
  test.use({ reducedMotion: "reduce" });

  test("shortens transitions and animations", async ({ page }) => {
    await openRoute(page, "/");
    const durations = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a[href], button")].map(
        (element) => getComputedStyle(element).transitionDuration,
      ),
    );
    expect(durations.length).toBeGreaterThan(0);
    for (const duration of durations) {
      for (const part of duration.split(",")) {
        expect(Number.parseFloat(part)).toBeLessThanOrEqual(0.01);
      }
    }
  });
});

for (const route of routes) {
  test(`@loading Pixel 7 keeps loading fixed in portrait and landscape at ${route}`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await installLoadingProbe(page);
    for (const viewport of [
      { width: 412, height: 915 },
      { width: 915, height: 412 },
    ]) {
      await page.setViewportSize(viewport);
      await openRoute(page, route);
      await assertLoadingFinished(page);
      const boundary = route === "/" ? "root-route" : "public-auth";
      await page.evaluate((name) => {
        const app = document.querySelector('[data-slot="app-root"]');
        if (!app) throw new Error("App root missing");
        const marker = document.createElement("div");
        marker.dataset.slot = "loading-state";
        marker.dataset.loadingBoundary = name;
        marker.dataset.loadingTest = "mobile";
        app.append(marker);
      }, boundary);
      await expect(
        page.locator('[data-slot="global-loading-indicator"]'),
      ).toHaveCSS("visibility", "visible");
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      assertLoadingTrace(
        await readLoadingTrace(page),
        `Pixel 7 ${route} ${viewport.width}x${viewport.height}`,
        true,
      );
      await page.locator('[data-loading-test="mobile"]').evaluate((el) => {
        el.remove();
      });
      await assertLoadingFinished(page);
    }
  });
}
