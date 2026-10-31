import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import esMessages from "../src/messages/es.json";

for (const envFile of [".env.local", ".env"]) {
  if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
    break;
  }
}

const rawHost =
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
if (!rawHost) {
  throw new Error(
    "Missing FIREBASE_AUTH_EMULATOR_HOST in environment. Define it in .env (e.g. 127.0.0.1:9099).",
  );
}

const emulator =
  rawHost.startsWith("http://") || rawHost.startsWith("https://")
    ? rawHost.replace(/\/$/, "")
    : `http://${rawHost}`.replace(/\/$/, "");
const authTestOrigin = `http://${new URL(emulator).hostname}:3100`;

const project =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
if (!project) {
  throw new Error(
    "Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in environment. Define it in .env (e.g. demo-test).",
  );
}

const password = process.env.TEST_USER_PASSWORD;
if (!password) {
  throw new Error(
    "Missing TEST_USER_PASSWORD in environment. Define it in .env.",
  );
}

// The suite runs against `next dev`, which compiles each route on its first request. On a
// 2 vCPU runner that first compile can take longer than the 30 s test budget, so the first
// test to reach a route times out intermittently. Compile every route once up front.
const warmedRoutes = [
  "/",
  "/sign-in",
  "/register",
  "/forgot-password",
  "/profile",
];

test.beforeAll(async ({ request }) => {
  test.setTimeout(180_000);
  for (const route of warmedRoutes) {
    await request.get(route, { failOnStatusCode: false, timeout: 120_000 });
  }
});

test("registration and persisted authentication redirect", async ({ page }) => {
  const email = `register-${crypto.randomUUID()}@example.test`;
  await page.goto("/sign-in");
  await page.getByRole("button", { name: /don't have an account/i }).click();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/sign-in");
  await expect(page).toHaveURL("/");
});

test("invalid credentials and successful sign-in", async ({
  page,
  request,
}) => {
  const email = `login-${crypto.randomUUID()}@example.test`;
  const created = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(created.ok()).toBeTruthy();
  await page.goto("/sign-in");
  await page.getByLabel("Email Address").fill(email);
  await page.locator("#password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL("/");
});

test("password recovery sends an emulator reset code and displays failures", async ({
  page,
  request,
}) => {
  const email = `reset-${crypto.randomUUID()}@example.test`;
  const create = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(create.ok()).toBeTruthy();
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Forgot Password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await page.getByLabel("Email Address").fill(email);
  await page.route("**/accounts:sendOobCode?*", (route) =>
    route.abort("failed"),
  );
  await page
    .getByRole("button", { name: "Reset Password", exact: true })
    .click();
  await expect(page.getByText(/unable to connect|network/i)).toBeVisible();
  await page.unrouteAll();
  await page
    .getByRole("button", { name: "Reset Password", exact: true })
    .click();
  await expect(
    page.getByText("Check your email for password reset instructions"),
  ).toBeVisible();
  const response = await request.get(
    `${emulator}/emulator/v1/projects/${project}/oobCodes`,
  );
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(
    body.oobCodes.some(
      (code: { email: string; requestType: string }) =>
        code.email === email && code.requestType === "PASSWORD_RESET",
    ),
  ).toBe(true);
});

test("navigation and translated screens", async ({ page, context }) => {
  await page.goto("/forgot-password");
  await page.getByRole("button", { name: /back to sign in/i }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "pt-BR", url: authTestOrigin },
  ]);
  await page.reload();
  await expect(page.getByLabel("Endereço de e-mail")).toBeVisible(); // check-english-ignore: pt-BR UI label
});

test("Google popup signs in with the emulator", async ({ page }) => {
  await page.goto("/sign-in");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  const popup = await popupPromise;
  await popup.getByRole("button", { name: /add new account/i }).click();
  await popup
    .getByLabel(/email/i)
    .fill(`google-${crypto.randomUUID()}@example.test`);
  await popup.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL("/");
});

test("Google redirect signs in when the browser identifies as Electron", async ({
  browser,
}) => {
  const electronContext = await browser.newContext({
    userAgent: "Mozilla/5.0 Electron/42.0.0",
  });
  const electronPage = await electronContext.newPage();

  try {
    await electronPage.goto(`${authTestOrigin}/sign-in`);
    const redirect = electronPage.waitForURL(/\/emulator\/auth\/handler/);
    await electronPage
      .getByRole("button", { name: "Sign in with Google" })
      .click();
    await redirect;
    await electronPage
      .getByRole("button", { name: /add new account/i })
      .click();
    await electronPage
      .getByLabel(/email/i)
      .fill(`electron-${crypto.randomUUID()}@example.test`);
    await electronPage.getByRole("button", { name: /sign in/i }).click();
    await expect(electronPage).toHaveURL(`${authTestOrigin}/`);
  } finally {
    await electronContext.close();
  }
});

test("profile displays user email and signs out successfully", async ({
  page,
  request,
}) => {
  const email = `profile-${crypto.randomUUID()}@example.test`;
  const created = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(created.ok()).toBeTruthy();
  await page.goto("/sign-in");
  await page.getByLabel("Email Address").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "My profile" })).toBeVisible();
  await expect(
    page.locator('[data-slot="global-loading-indicator"]'),
  ).toHaveCSS("visibility", "hidden");

  await page.evaluate(() => {
    const spinner = document.querySelector(
      '[data-slot="global-loading-indicator"] [data-slot="spinner"]',
    );
    if (!spinner) throw new Error("Root loading indicator not mounted");
    (
      window as Window & { __profileLoadingSpinner?: Element }
    ).__profileLoadingSpinner = spinner;
  });
  // Observe every visible loading frame during the real route transition.
  // Previous tests only compared DOM nodes before and after navigation.
  await page.evaluate(() => {
    const root = document.querySelector(
      '[data-slot="global-loading-indicator"] [data-slot="spinner"]',
    );
    if (!root) throw new Error("Missing persistent loading spinner");
    const trace: { x: number; y: number; source: string }[] = [];
    let running = true;
    const sample = () => {
      if (!running) return;
      const spinners = document.querySelectorAll<SVGSVGElement>(
        '[data-slot="loading-overlay"] [data-slot="spinner"]',
      );
      for (const spinner of spinners) {
        if (getComputedStyle(spinner).visibility !== "visible") continue;
        const bounds = spinner.getBoundingClientRect();
        trace.push({
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
          source: spinner.closest('[data-slot="global-loading-indicator"]')
            ? "root"
            : "fallback",
        });
      }
      requestAnimationFrame(sample);
    };
    const browser = window as typeof window & {
      __profileLoadingTrace?: () => {
        sameNode: boolean;
        bodyChild: boolean;
        trace: typeof trace;
        viewportWidth: number;
        viewportHeight: number;
      };
    };
    browser.__profileLoadingTrace = () => {
      running = false;
      return {
        sameNode:
          root ===
          document.querySelector(
            '[data-slot="global-loading-indicator"] [data-slot="spinner"]',
          ),
        bodyChild:
          root.closest('[data-slot="global-loading-indicator"]')
            ?.parentElement === document.body,
        trace,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    };
    requestAnimationFrame(sample);
  });
  await page.getByRole("link", { name: "My profile" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
  const loadingMotion = await page.evaluate(() => {
    const browser = window as typeof window & {
      __profileLoadingTrace?: () => {
        sameNode: boolean;
        bodyChild: boolean;
        trace: { x: number; y: number; source: string }[];
        viewportWidth: number;
        viewportHeight: number;
      };
    };
    return browser.__profileLoadingTrace?.();
  });
  expect(loadingMotion?.sameNode).toBe(true);
  expect(loadingMotion?.bodyChild).toBe(true);
  expect(loadingMotion?.trace.every((sample) => sample.source === "root")).toBe(
    true,
  );
  for (const sample of loadingMotion?.trace ?? []) {
    expect(sample.x).toBeGreaterThan(0);
    expect(sample.x).toBeLessThan(loadingMotion?.viewportWidth ?? 0);
    expect(
      Math.abs(sample.y - (loadingMotion?.viewportHeight ?? 0) / 2),
    ).toBeLessThanOrEqual(1);
  }

  // Navigating into the protected route must not mount a new loading icon:
  // the root indicator remains the same DOM node across route/auth/profile.
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __profileLoadingSpinner?: Element })
          .__profileLoadingSpinner ===
        document.querySelector(
          '[data-slot="global-loading-indicator"] [data-slot="spinner"]',
        ),
    ),
  ).toBe(true);
  await expect(page.getByRole("button", { name: "Sign Out" })).toHaveCount(0);
  await page.getByRole("link", { name: "Back to Home" }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
});

test("saving the profile language keeps the unprefixed route and translates after refresh", async ({
  page,
  request,
  context,
}) => {
  const email = `locale-${crypto.randomUUID()}@example.test`;
  const created = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(created.ok()).toBeTruthy();
  await page.goto("/sign-in");
  await page.getByLabel("Email Address").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: "My profile" }).click();
  await expect(page).toHaveURL(`${authTestOrigin}/profile`);
  await page.getByLabel("Language", { exact: true }).click();
  await page
    .getByRole("option", {
      name: esMessages.Auth.languageOptions.es,
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(
    page.getByText(esMessages.Auth.personalInfoTitle, { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(`${authTestOrigin}/profile`);
  expect(
    (await context.cookies()).find((cookie) => cookie.name === "NEXT_LOCALE")
      ?.value,
  ).toBe("es");
  await page.reload();
  await expect(
    page.getByText(esMessages.Auth.personalInfoTitle, { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(`${authTestOrigin}/profile`);
});

const accessibilityTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

for (const route of ["/sign-in", "/register", "/forgot-password"]) {
  test(`@a11y emulator renders accessible ${route} form`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main input").first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(accessibilityTags)
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("@a11y authenticated profile has no detected WCAG A/AA violations", async ({
  page,
  request,
}) => {
  const email = `a11y-profile-${crypto.randomUUID()}@example.test`;
  const created = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(created.ok()).toBeTruthy();

  await page.goto("/sign-in");
  await page.getByLabel("Email Address").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/profile");
  await expect(page.getByLabel("Language", { exact: true })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(accessibilityTags)
    .analyze();
  expect(results.violations).toEqual([]);
});

// The profile card once rendered at a fixed 384 px on every screen, and its edge vanished into
// the page background in both themes. Geometry and computed styles catch both without
// platform-specific screenshot baselines.
const profileViewports = [
  { width: 390, height: 844, minRatio: 0.85, maxWidth: 390 },
  { width: 768, height: 1024, minRatio: 0.55, maxWidth: 448 },
  { width: 1440, height: 900, minRatio: 0.3, maxWidth: 512 },
];

for (const colorScheme of ["light", "dark"] as const) {
  for (const viewport of profileViewports) {
    test(`profile card scales and stays visible at ${viewport.width}px in ${colorScheme} mode`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.emulateMedia({ colorScheme });
      const email = `layout-${crypto.randomUUID()}@example.test`;
      const created = await request.post(
        `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
        { data: { email, password, returnSecureToken: true } },
      );
      expect(created.ok()).toBeTruthy();
      await page.goto("/sign-in");
      await page.getByLabel("Email Address").fill(email);
      await page.locator("#password").fill(password);
      await page.getByRole("button", { name: "Sign In", exact: true }).click();
      await expect(page).toHaveURL("/");
      await page.goto("/profile");

      const card = page.locator('[data-slot="card"]').first();
      await expect(card).toBeVisible();
      const box = await card.boundingBox();
      if (!box) throw new Error("The profile card has no bounding box");
      expect(box.width).toBeLessThanOrEqual(viewport.maxWidth);
      expect(box.width / viewport.width).toBeGreaterThanOrEqual(
        viewport.minRatio,
      );
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);

      const edge = await card.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          cardBackground: style.backgroundColor,
          pageBackground: getComputedStyle(document.body).backgroundColor,
          shadow: style.boxShadow,
        };
      });
      // Either the fill differs from the page, or the edge is drawn with a ring or shadow.
      expect(
        edge.cardBackground !== edge.pageBackground ||
          (edge.shadow !== "none" && edge.shadow !== ""),
      ).toBe(true);
    });
  }
}
