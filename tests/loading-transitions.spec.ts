import { expect, test } from "@playwright/test";
import {
  assertLoadingFinished,
  assertLoadingTrace,
  installLoadingProbe,
  readLoadingTrace,
} from "./support/loading-motion";

const routes = [
  {
    path: "/",
    ready: "main h1",
    boundaries: ["root-provider", "root-route", "home-session"],
  },
  {
    path: "/sign-in",
    ready: "main input",
    boundaries: ["root-provider", "root-route", "public-layout", "public-auth"],
  },
  {
    path: "/register",
    ready: "main input",
    boundaries: ["root-provider", "root-route", "public-layout", "public-auth"],
  },
  {
    path: "/forgot-password",
    ready: "main input",
    boundaries: ["root-provider", "root-route", "public-layout", "public-auth"],
  },
] as const;

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

for (const route of routes) {
  test(`@loading checks all loading boundaries at ${route.path}`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await installLoadingProbe(page);
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const response = await page.goto(route.path);
      expect(response?.ok()).toBe(true);
      await expect(page.locator(route.ready).first()).toBeVisible();
      await assertLoadingFinished(page);
      assertLoadingTrace(
        await readLoadingTrace(page),
        `${route.path} initial page load at ${viewport.width}px`,
      );

      // Force each *real* boundary marker to be visible on its destination
      // page. These geometry checks supplement, not replace, the navigation
      // tests below: a fast RSC response may never suspend in CI.
      for (const boundary of route.boundaries) {
        await page.evaluate((name) => {
          const app = document.querySelector('[data-slot="app-root"]');
          if (!app) throw new Error("Root app layout is missing");
          const marker = document.createElement("div");
          marker.dataset.slot = "loading-state";
          marker.dataset.loadingBoundary = name;
          marker.dataset.loadingTest = "active";
          app.append(marker);
        }, boundary);
        await expect(
          page.locator('[data-slot="global-loading-indicator"]'),
        ).toHaveCSS("visibility", "visible");
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              ),
            ),
        );
        const trace = await readLoadingTrace(page);
        expect(
          trace.frames.some(
            (frame) =>
              frame.pending.includes(boundary) && frame.visible.length === 1,
          ),
          `${route.path}: no frame exercised ${boundary}`,
        ).toBe(true);
        assertLoadingTrace(
          trace,
          `${route.path}: ${boundary} at ${viewport.width}px`,
          true,
        );
        await page.locator('[data-loading-test="active"]').evaluate((el) => {
          el.remove();
        });
        await assertLoadingFinished(page);
      }
    }
  });
}

test("@loading records real public-layout navigation and no stuck overlay", async ({
  page,
}) => {
  await installLoadingProbe(page);
  await page.goto("/sign-in");
  await expect(page.getByLabel("Email Address")).toBeVisible();
  await assertLoadingFinished(page);

  await page.getByRole("button", { name: /don't have an account/i }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByLabel("Email Address")).toBeVisible();
  await assertLoadingFinished(page);

  await page.goto("/forgot-password");
  await expect(page.getByLabel("Email Address")).toBeVisible();
  await assertLoadingFinished(page);

  await page.getByRole("button", { name: /back to sign in/i }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByLabel("Email Address")).toBeVisible();
  await assertLoadingFinished(page);

  assertLoadingTrace(
    await readLoadingTrace(page),
    "sign-in → register → forgot-password → sign-in",
  );
});
