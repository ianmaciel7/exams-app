import { expect, type Page } from "@playwright/test";

type VisibleIndicator = {
  origin: "global" | "local";
  x: number;
  y: number;
  iconX: number;
  iconY: number;
  expectedX: number;
  expectedY: number;
};

export type LoadingFrame = {
  path: string;
  pending: string[];
  visible: VisibleIndicator[];
  viewportHeight: number;
  viewportWidth: number;
};

export type LoadingTrace = {
  frames: LoadingFrame[];
  rootChanged: boolean;
};

/**
 * Observe the rendered page on every animation frame, including states that
 * appear briefly between a route fallback, auth guard, and profile preferences.
 * Install BEFORE navigation: checking only the final DOM misses these changes.
 */
export async function installLoadingProbe(page: Page) {
  await page.addInitScript(() => {
    type Frame = {
      path: string;
      pending: string[];
      visible: {
        origin: "global" | "local";
        x: number;
        y: number;
        iconX: number;
        iconY: number;
        expectedX: number;
        expectedY: number;
      }[];
      viewportHeight: number;
      viewportWidth: number;
    };
    const state = { frames: [] as Frame[], rootChanged: false };
    (
      window as typeof window & { __loadingProbe?: typeof state }
    ).__loadingProbe = state;
    let firstRoot: Element | null = null;
    let lastSignature = "";

    function isRendered(element: Element) {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.visibility === "visible" &&
        style.display !== "none" &&
        rect.width > 0 &&
        rect.height > 0
      );
    }

    function record() {
      const root = document.querySelector(
        '[data-slot="global-loading-indicator"] [data-slot="spinner"]',
      );
      if (root) {
        if (firstRoot && root !== firstRoot) state.rootChanged = true;
        firstRoot ??= root;
      }
      const pending = Array.from(
        document.querySelectorAll('[data-slot="loading-state"]'),
      )
        .filter((element) => {
          // Empty marker elements still have a client rect when rendered.
          const style = getComputedStyle(element);
          return (
            style.display !== "none" && element.getClientRects().length > 0
          );
        })
        .map(
          (element) =>
            element.getAttribute("data-loading-boundary") ?? "unlabeled",
        );
      const visible = Array.from(
        document.querySelectorAll(
          '[data-slot="loading-overlay"] [data-slot="labeled-spinner"]',
        ),
      )
        .filter(isRendered)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const icon = element.querySelector('[data-slot="spinner"]');
          if (!icon) throw new Error("Labeled loading indicator has no icon");
          const iconBox = icon.getBoundingClientRect();
          const overlay = element.closest('[data-slot="loading-overlay"]');
          const center = overlay?.firstElementChild?.getBoundingClientRect();
          return {
            origin: element.closest('[data-slot="global-loading-indicator"]')
              ? ("global" as const)
              : ("local" as const),
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            iconX: iconBox.left + iconBox.width / 2,
            iconY: iconBox.top + iconBox.height / 2,
            expectedX: center ? center.left + center.width / 2 : 0,
            expectedY: center ? center.top + center.height / 2 : 0,
          };
        });
      const frame: Frame = {
        path: location.pathname,
        pending,
        visible,
        viewportHeight: innerHeight,
        viewportWidth: innerWidth,
      };
      const signature = JSON.stringify({
        path: frame.path,
        pending,
        visible: visible.map(({ origin, x, y, iconX, iconY }) => ({
          origin,
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          iconX: Math.round(iconX * 10) / 10,
          iconY: Math.round(iconY * 10) / 10,
        })),
      });
      // Record every active frame and every change of state. Cap memory while
      // preserving the first frames rather than silently hiding a first jump.
      if (
        state.frames.length < 8000 &&
        (pending.length > 0 ||
          visible.length > 0 ||
          signature !== lastSignature)
      ) {
        state.frames.push(frame);
      }
      lastSignature = signature;
      requestAnimationFrame(record);
    }

    requestAnimationFrame(record);
  });
}

export async function readLoadingTrace(page: Page): Promise<LoadingTrace> {
  return page.evaluate(() => {
    const trace = (window as typeof window & { __loadingProbe?: LoadingTrace })
      .__loadingProbe;
    if (!trace) throw new Error("Loading probe did not start");
    return { frames: trace.frames, rootChanged: trace.rootChanged };
  });
}

export function assertLoadingTrace(
  trace: LoadingTrace,
  scenario: string,
  requireVisible = false,
) {
  expect(trace.frames.length, scenario).toBeGreaterThan(0);
  expect(trace.rootChanged, `${scenario}: global spinner was remounted`).toBe(
    false,
  );
  const visibleFrames = trace.frames.filter(
    (frame) => frame.visible.length > 0,
  );
  if (requireVisible) {
    expect(
      visibleFrames.length,
      `${scenario}: no loading state was actually observed`,
    ).toBeGreaterThan(0);
  }

  let reference: VisibleIndicator | undefined;
  let referenceHeight: number | undefined;
  let referenceWidth: number | undefined;
  for (const frame of trace.frames) {
    expect(
      frame.visible.length,
      `${scenario}: duplicate indicators at ${frame.path}, boundaries ${frame.pending.join(", ")}`,
    ).toBeLessThanOrEqual(1);
    for (const indicator of frame.visible) {
      expect(
        indicator.origin,
        `${scenario}: a replacement spinner became visible`,
      ).toBe("global");
      expect(
        frame.pending.length,
        `${scenario}: overlay was visible without an active loading boundary`,
      ).toBeGreaterThan(0);
      expect(
        Math.abs(indicator.x - indicator.expectedX),
        `${scenario}: horizontal center drift at ${frame.path}`,
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(indicator.y - indicator.expectedY),
        `${scenario}: vertical center drift at ${frame.path}`,
      ).toBeLessThanOrEqual(1);
      if (
        reference &&
        referenceHeight === frame.viewportHeight &&
        referenceWidth === frame.viewportWidth
      ) {
        expect(
          Math.abs(indicator.x - reference.x),
          `${scenario}: horizontal jump across loading phases`,
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(indicator.y - reference.y),
          `${scenario}: vertical jump across loading phases`,
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(indicator.iconX - reference.iconX),
          `${scenario}: spinner icon jumped horizontally`,
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(indicator.iconY - reference.iconY),
          `${scenario}: spinner icon jumped vertically`,
        ).toBeLessThanOrEqual(1);
      } else {
        reference = indicator;
        referenceHeight = frame.viewportHeight;
        referenceWidth = frame.viewportWidth;
      }
    }
  }
}

export async function assertLoadingFinished(page: Page) {
  await expect(
    page.locator('[data-slot="global-loading-indicator"]'),
  ).toHaveCSS("visibility", "hidden");
  await expect(
    page.locator('[data-slot="global-loading-indicator"]'),
  ).toHaveCSS("pointer-events", "none");
}
