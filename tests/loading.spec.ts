import { expect, test } from "@playwright/test";

test("keeps a single viewport-stable spinner through loading-state replacements", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const result = await page.evaluate(async () => {
    const global = document.querySelector<HTMLElement>(
      '[data-slot="global-loading-indicator"]',
    );
    const spinner = global?.querySelector<SVGSVGElement>(
      '[data-slot="spinner"]',
    );
    if (!global || !spinner) {
      throw new Error("The persistent loading indicator is missing");
    }
    // The global spinner must survive even when app-root's Suspense tree is
    // replaced by the root fallback.
    if (global.parentElement !== document.body) {
      throw new Error("The spinner is incorrectly nested in app-root");
    }

    const nextFrame = () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const center = () => {
      const bounds = spinner.getBoundingClientRect();
      return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      };
    };
    const initialVisibility = getComputedStyle(global).visibility;
    const first = document.createElement("div");
    first.dataset.slot = "loading-state";
    document.body.append(first);
    await nextFrame();
    const firstCenter = center();
    const firstVisibility = getComputedStyle(global).visibility;
    const firstAnimation = getComputedStyle(spinner).animationPlayState;

    const second = document.createElement("div");
    second.dataset.slot = "loading-state";
    first.replaceWith(second);
    await nextFrame();
    const secondCenter = center();
    const sameSpinner =
      spinner ===
      document.querySelector(
        '[data-slot="global-loading-indicator"] [data-slot="spinner"]',
      );
    const secondVisibility = getComputedStyle(global).visibility;

    second.remove();
    await nextFrame();
    return {
      initialVisibility,
      firstCenter,
      firstVisibility,
      firstAnimation,
      secondCenter,
      secondVisibility,
      sameSpinner,
      finalVisibility: getComputedStyle(global).visibility,
      finalAnimation: getComputedStyle(spinner).animationPlayState,
    };
  });

  expect(result.initialVisibility).toBe("hidden");
  expect(result.firstVisibility).toBe("visible");
  expect(result.secondVisibility).toBe("visible");
  expect(result.sameSpinner).toBe(true);
  expect(result.firstAnimation).toBe("running");
  expect(result.finalAnimation).toBe("paused");
  expect(result.finalVisibility).toBe("hidden");
  expect(Math.abs(result.firstCenter.x - result.secondCenter.x)).toBeLessThan(
    0.5,
  );
  expect(Math.abs(result.firstCenter.y - result.secondCenter.y)).toBeLessThan(
    0.5,
  );
});
