// cspell:ignore domcontentloaded describedby
import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import {
  type APIRequestContext,
  type Browser,
  devices,
  expect,
  type Page,
  test,
} from "@playwright/test";
import esMessages from "../src/messages/es.json";
import {
  assertLoadingFinished,
  assertLoadingTrace,
  installLoadingProbe,
  readLoadingTrace,
} from "./support/loading-motion";

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

const signInEmail = (page: Page) =>
  page.locator('input[autocomplete="username"]');
const signInPassword = (page: Page) =>
  page.locator('input[autocomplete="current-password"]');
const signUpEmail = (page: Page) => page.locator('input[autocomplete="email"]');
const signUpPassword = (page: Page) =>
  page.locator('input[autocomplete="new-password"]');
const recoveryEmail = (page: Page) =>
  page.locator('input[type="email"][autocomplete="email"]');

const project =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
if (!project) {
  throw new Error(
    "Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in environment. Define it in .env (e.g. demo-test).",
  );
}

const firestoreEmulatorHost =
  process.env.FIRESTORE_EMULATOR_HOST ||
  process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ||
  "127.0.0.1:8080";
const firestoreEmulatorOrigin = new URL(
  firestoreEmulatorHost.includes("://")
    ? firestoreEmulatorHost
    : `http://${firestoreEmulatorHost}`,
).origin;

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
  await signUpEmail(page).fill(email);
  await signUpPassword(page).fill(password);
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
  await signInEmail(page).fill(email);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill("wrong-password");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
  await signInPassword(page).fill(password);
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
  // Route transitions can retain previous form controls in the DOM; the
  // autocomplete token identifies the recovery email field on this route.
  const emailField = recoveryEmail(page);
  await expect(emailField).toBeVisible();
  await page
    .getByRole("button", { name: "Reset Password", exact: true })
    .click();
  const emailError = page.getByRole("alert").filter({ visible: true }).first();
  await expect(emailError).toBeVisible();
  await expect(emailField).toHaveAttribute("aria-invalid", "true");
  const emailErrorId = await emailError.getAttribute("id");
  expect(emailErrorId).toBeTruthy();
  await expect(emailField).toHaveAttribute(
    "aria-describedby",
    emailErrorId ?? "",
  );
  await emailField.fill(email);
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
  // The emulator serves the OAuth account picker from a separate page. Give
  // that first page its own startup budget on constrained CI runners, while
  // still requiring the first attempt to complete successfully.
  test.setTimeout(60_000);
  await page.goto("/sign-in");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  const addAccount = popup.getByRole("button", { name: /add new account/i });
  await expect(addAccount).toBeEnabled();
  await addAccount.click();
  const email = popup.getByLabel(/email/i);
  await expect(email).toBeVisible();
  await email.fill(`google-${crypto.randomUUID()}@example.test`);
  const popupClosed = popup.waitForEvent("close");
  await popup.getByRole("button", { name: /sign in/i }).click();
  await popupClosed;
  await expect(page).toHaveURL("/", { timeout: 30_000 });
});

test("Google popup cancellation restores sign-in and supports retry", async ({
  page,
}) => {
  await page.goto("/sign-in");
  const googleButton = page.getByRole("button", {
    name: "Sign in with Google",
  });
  const emailField = signInEmail(page);

  await expect(googleButton).toBeEnabled();

  // Cancel the first attempt instead of completing the happy path.
  const firstPopupPromise = page.waitForEvent("popup");
  await googleButton.click();
  const firstPopup = await firstPopupPromise;
  await firstPopup.close();

  // A dismissed OAuth popup must not strand the form in a pending state.
  await expect(googleButton).toBeEnabled({ timeout: 15_000 });
  await expect(emailField).toBeEditable();
  await expect(page).toHaveURL(`${authTestOrigin}/sign-in`);

  // Recoverability is not established until the next attempt also works.
  const secondPopupPromise = page.waitForEvent("popup");
  await googleButton.click();
  const secondPopup = await secondPopupPromise;
  await secondPopup.close();

  await expect(googleButton).toBeEnabled({ timeout: 15_000 });
  await expect(emailField).toBeEditable();
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
  await signInEmail(page).fill(email);
  await signInPassword(page).fill(password);
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
        '[data-slot="global-loading-indicator"] [data-slot="spinner"]',
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
  await signInEmail(page).fill(email);
  await signInPassword(page).fill(password);
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

test("@loading observes every protected layout state during real profile journey", async ({
  page,
  request,
}, testInfo) => {
  test.setTimeout(90_000);
  const email = `loading-profile-${crypto.randomUUID()}@example.test`;
  const created = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(created.ok()).toBe(true);
  await installLoadingProbe(page);
  await page.goto("/sign-in");
  await expect(page.getByLabel("Email Address")).toBeVisible();
  await assertLoadingFinished(page);

  await page.getByLabel("Email Address").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "My profile" })).toBeVisible();
  await assertLoadingFinished(page);

  await page.getByRole("link", { name: "My profile" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
  await assertLoadingFinished(page);

  // Force each owned boundary on the actual authenticated profile document.
  // This makes coverage deterministic when fast RSC responses skip fallback UI.
  for (const boundary of [
    "root-provider",
    "root-route",
    "protected-layout",
    "protected-auth",
    "profile-preferences",
  ]) {
    await page.evaluate((name) => {
      const app = document.querySelector('[data-slot="app-root"]');
      if (!app) throw new Error("App root missing");
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
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const trace = await readLoadingTrace(page);
    expect(
      trace.frames.some(
        (frame) =>
          frame.pending.includes(boundary) && frame.visible.length === 1,
      ),
      `Missing an observed frame for ${boundary}`,
    ).toBe(true);
    assertLoadingTrace(trace, `authenticated profile: ${boundary}`, true);
    await page.locator('[data-loading-test="active"]').evaluate((el) => {
      el.remove();
    });
    await assertLoadingFinished(page);
  }

  await page.getByRole("link", { name: "Back to Home" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "My profile" })).toBeVisible();
  await assertLoadingFinished(page);

  const trace = await readLoadingTrace(page);
  await testInfo.attach("profile-loading-frames.json", {
    body: Buffer.from(JSON.stringify(trace, null, 2)),
    contentType: "application/json",
  });
  assertLoadingTrace(trace, "sign-in → Home → Profile");
});

test("@loading Pixel 7 real authenticated Home to Profile does not jump", async ({
  browser,
  request,
}, testInfo) => {
  test.setTimeout(90_000);
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();
  const email = `mobile-profile-${crypto.randomUUID()}@example.test`;
  try {
    const created = await request.post(
      `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
      { data: { email, password, returnSecureToken: true } },
    );
    expect(created.ok()).toBe(true);
    await installLoadingProbe(page);
    await page.goto(`${authTestOrigin}/sign-in`);
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await assertLoadingFinished(page);
    await page.getByLabel("Email Address").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL(`${authTestOrigin}/`);
    await expect(page.getByRole("link", { name: "My profile" })).toBeVisible();
    await assertLoadingFinished(page);
    await page.getByRole("link", { name: "My profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
    await assertLoadingFinished(page);
    const trace = await readLoadingTrace(page);
    await testInfo.attach("mobile-profile-loading-frames.json", {
      body: Buffer.from(JSON.stringify(trace, null, 2)),
      contentType: "application/json",
    });
    assertLoadingTrace(trace, "Pixel 7 sign-in → Home → Profile", true);
  } finally {
    await context.close();
  }
});

test("guest deep link returns to the protected page after sign-in", async ({
  page,
  request,
}) => {
  const email = `return-${crypto.randomUUID()}@example.test`;
  const created = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(created.ok()).toBe(true);

  await page.goto("/profile?tab=security");
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === "/sign-in" &&
      url.searchParams.get("next") === "/profile?tab=security",
  );
  expect(new URL(page.url()).searchParams.get("next")).toBe(
    "/profile?tab=security",
  );

  await signInEmail(page).fill(email);
  await signInPassword(page).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();

  await expect(page).toHaveURL(`${authTestOrigin}/profile?tab=security`);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
});

test("profile changes survive reload, sign-out and a new sign-in", async ({
  page,
  request,
}) => {
  test.setTimeout(60_000);
  const email = `persist-${crypto.randomUUID()}@example.test`;
  const displayName = "Regression Journey User";
  const created = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(created.ok()).toBe(true);
  const account = (await created.json()) as {
    idToken: string;
    localId: string;
  };

  await page.goto("/sign-in");
  await signInEmail(page).fill(email);
  await signInPassword(page).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: "My profile" }).click();
  await expect(page).toHaveURL(`${authTestOrigin}/profile`);

  await page.getByLabel("Name", { exact: true }).fill(displayName);
  await page.getByLabel("Theme", { exact: true }).click();
  await page.getByRole("option", { name: "Dark", exact: true }).click();
  await page.getByRole("button", { name: "Save profile", exact: true }).click();

  // The backend is an independent oracle: a toast or mocked callback is not
  // sufficient evidence that Firestore persisted the user's preferences.
  const documentUrl = `${firestoreEmulatorOrigin}/v1/projects/${project}/databases/(default)/documents/users/${account.localId}`;
  await expect
    .poll(
      async () => {
        const response = await request.get(documentUrl, {
          headers: { Authorization: `Bearer ${account.idToken}` },
        });
        if (!response.ok()) return null;
        const body = (await response.json()) as {
          fields?: { theme?: { stringValue?: string } };
        };
        return body.fields?.theme?.stringValue ?? null;
      },
      { message: "theme must be persisted in Firestore", timeout: 15_000 },
    )
    .toBe("dark");

  await page.reload();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    displayName,
  );
  await expect(page.getByLabel("Theme", { exact: true })).toContainText("Dark");

  await page.getByRole("link", { name: "Back to Home" }).click();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();

  await page.goto("/sign-in");
  await signInEmail(page).fill(email);
  await signInPassword(page).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByRole("link", { name: "My profile" }).click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    displayName,
  );
  await expect(page.getByLabel("Theme", { exact: true })).toContainText("Dark");
});

test("Firestore user preferences are private to their owner", async ({
  request,
}) => {
  const createAccount = async (prefix: string) => {
    const response = await request.post(
      `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
      {
        data: {
          email: `${prefix}-${crypto.randomUUID()}@example.test`,
          password,
          returnSecureToken: true,
        },
      },
    );
    expect(response.ok()).toBe(true);
    return (await response.json()) as { idToken: string; localId: string };
  };

  const owner = await createAccount("owner");
  const stranger = await createAccount("stranger");
  const documentUrl = `${firestoreEmulatorOrigin}/v1/projects/${project}/databases/(default)/documents/users/${owner.localId}`;

  const written = await request.patch(documentUrl, {
    headers: { Authorization: `Bearer ${owner.idToken}` },
    data: {
      fields: {
        locale: { stringValue: "en" },
        theme: { stringValue: "dark" },
      },
    },
  });
  expect(written.ok(), "owner must be able to save preferences").toBe(true);

  const ownerRead = await request.get(documentUrl, {
    headers: { Authorization: `Bearer ${owner.idToken}` },
  });
  expect(ownerRead.ok(), "owner must be able to read preferences").toBe(true);
  const saved = (await ownerRead.json()) as {
    fields?: { theme?: { stringValue?: string } };
  };
  expect(saved.fields?.theme?.stringValue).toBe("dark");

  const strangerWrite = await request.patch(documentUrl, {
    headers: { Authorization: `Bearer ${stranger.idToken}` },
    data: {
      fields: {
        locale: { stringValue: "en" },
        theme: { stringValue: "light" },
      },
    },
  });
  expect(
    strangerWrite.status(),
    "other accounts must not write preferences",
  ).toBe(403);

  const strangerRead = await request.get(documentUrl, {
    headers: { Authorization: `Bearer ${stranger.idToken}` },
  });
  expect(
    strangerRead.status(),
    "other accounts must not read preferences",
  ).toBe(403);

  const guestRead = await request.get(documentUrl);
  expect(guestRead.status(), "unauthenticated clients must be denied").toBe(
    403,
  );
});

type TestAccount = {
  email: string;
  idToken: string;
  localId: string;
  refreshToken: string;
};

async function createAccount(
  request: APIRequestContext,
  prefix: string,
): Promise<TestAccount> {
  const email = `${prefix}-${crypto.randomUUID()}@example.test`;
  const response = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(response.ok()).toBe(true);
  return { ...(await response.json()), email };
}

const signInUrlTo = (next: string) =>
  `/sign-in?next=${encodeURIComponent(next)}`;

async function signIn(page: Page, email: string, path = "/sign-in") {
  await page.goto(path);
  await signInEmail(page).fill(email);
  await signInPassword(page).fill(password ?? "");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

/** Refreshes like `getIdToken(true)`, which is how a client receives new claims. */
async function refreshIdToken(
  request: APIRequestContext,
  refreshToken: string,
) {
  const response = await request.post(
    `${emulator}/securetoken.googleapis.com/v1/token?key=emulator-only`,
    { form: { grant_type: "refresh_token", refresh_token: refreshToken } },
  );
  expect(response.ok()).toBe(true);
  return ((await response.json()) as { id_token: string }).id_token;
}

/** Applies an administrative change through the emulator's owner credential. */
async function updateAccount(
  request: APIRequestContext,
  localId: string,
  changes: Record<string, unknown>,
) {
  const response = await request.post(
    `${emulator}/identitytoolkit.googleapis.com/v1/projects/${project}/accounts:update`,
    {
      headers: { Authorization: "Bearer owner" },
      data: { localId, ...changes },
    },
  );
  expect(response.ok()).toBe(true);
}

/** The Auth emulator does not check signatures, so only the claims matter. */
function unsignedToken(claims: Record<string, unknown>) {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(claims)}.`;
}

function expiredToken(uid: string) {
  const now = Math.floor(Date.now() / 1000);
  return unsignedToken({
    aud: project,
    auth_time: now - 7200,
    exp: now - 3600,
    iat: now - 7200,
    iss: `https://securetoken.google.com/${project}`,
    sub: uid,
    user_id: uid,
  });
}

/** Opens a protected route carrying the token the worker would have forwarded. */
async function openProfileWithBridgeToken(
  browser: Browser,
  token: string,
): Promise<URL> {
  const context = await browser.newContext({
    baseURL: authTestOrigin,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "x-firebase-auth-bridge": "1",
    },
    serviceWorkers: "block",
  });
  try {
    const page = await context.newPage();
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/sign-in/);
    return new URL(page.url());
  } finally {
    await context.close();
  }
}

test.describe("server session verification", () => {
  // Without a client session, both verdicts end at sign-in. Only the client gate
  // knows the route, so `next` identifies which layer sent the visitor there.
  test("accepts a valid token and leaves navigation to the client gate", async ({
    browser,
    request,
  }) => {
    const account = await createAccount(request, "bridge-valid");
    const url = await openProfileWithBridgeToken(browser, account.idToken);
    expect(url.searchParams.get("next")).toBe("/profile");
  });

  test("rejects a malformed token", async ({ browser }) => {
    const url = await openProfileWithBridgeToken(browser, "not-a-token");
    expect(url.searchParams.get("next")).toBe("/");
  });

  test("rejects an expired token", async ({ browser, request }) => {
    const account = await createAccount(request, "bridge-expired");
    const url = await openProfileWithBridgeToken(
      browser,
      expiredToken(account.localId),
    );
    expect(url.searchParams.get("next")).toBe("/");
  });

  test("rejects a token issued before revocation", async ({
    browser,
    request,
  }) => {
    const account = await createAccount(request, "bridge-revoked");
    await updateAccount(request, account.localId, {
      validSince: String(Math.floor(Date.now() / 1000) + 60),
    });
    const url = await openProfileWithBridgeToken(browser, account.idToken);
    expect(url.searchParams.get("next")).toBe("/");
  });

  test("rejects the token of a disabled account", async ({
    browser,
    request,
  }) => {
    const account = await createAccount(request, "bridge-disabled");
    await updateAccount(request, account.localId, { disableUser: true });
    const url = await openProfileWithBridgeToken(browser, account.idToken);
    expect(url.searchParams.get("next")).toBe("/");
  });

  test("rejects the token of a deleted account", async ({
    browser,
    request,
  }) => {
    const account = await createAccount(request, "bridge-deleted");
    const deleted = await request.post(
      `${emulator}/identitytoolkit.googleapis.com/v1/accounts:delete?key=emulator-only`,
      { data: { idToken: account.idToken } },
    );
    expect(deleted.ok()).toBe(true);
    const url = await openProfileWithBridgeToken(browser, account.idToken);
    expect(url.searchParams.get("next")).toBe("/");
  });

  test("a rejected token cannot loop a client that is still signed in", async ({
    browser,
    request,
  }) => {
    const account = await createAccount(request, "bridge-loop");
    const context = await browser.newContext({
      baseURL: authTestOrigin,
      serviceWorkers: "block",
    });
    try {
      const page = await context.newPage();
      await signIn(page, account.email);
      await expect(page).toHaveURL(`${authTestOrigin}/`);

      let protectedLoads = 0;
      // Only the document request: Firebase SDK calls must keep their own auth.
      await page.route("**/profile", (route) => {
        // The home page also prefetches this route; only documents can loop.
        if (!route.request().isNavigationRequest()) return route.continue();
        protectedLoads += 1;
        return route.continue({
          headers: {
            ...route.request().headers(),
            authorization: "Bearer not-a-token",
            "x-firebase-auth-bridge": "1",
          },
        });
      });
      await page.goto("/profile");

      await expect(page).toHaveURL(`${authTestOrigin}/`, { timeout: 15_000 });
      await expect(
        page.getByRole("link", { name: "My profile" }),
      ).toBeVisible();
      await page.waitForTimeout(1_500);
      await expect(page).toHaveURL(`${authTestOrigin}/`);
      expect(protectedLoads).toBe(1);
    } finally {
      await context.close();
    }
  });
});

test("a first load without the worker still reaches the signed-in profile", async ({
  browser,
  request,
}) => {
  const account = await createAccount(request, "no-worker");
  const context = await browser.newContext({
    baseURL: authTestOrigin,
    serviceWorkers: "block",
  });
  try {
    const page = await context.newPage();
    await signIn(page, account.email, signInUrlTo("/profile?tab=security"));
    await expect(page).toHaveURL(`${authTestOrigin}/profile?tab=security`);
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
      account.email,
    );
    await page.reload();
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
      account.email,
    );
  } finally {
    await context.close();
  }
});

async function waitForActiveWorker(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
}

test("an active worker forwards a fresh token on navigation", async ({
  context,
  page,
  request,
}) => {
  const account = await createAccount(request, "worker");
  const forwarded: string[] = [];
  context.on("request", (sent) => {
    const { authorization, "x-firebase-auth-bridge": bridge } = sent.headers();
    if (new URL(sent.url()).pathname === "/profile" && bridge === "1") {
      forwarded.push(authorization ?? "");
    }
  });

  await signIn(page, account.email);
  await expect(page).toHaveURL("/");
  await waitForActiveWorker(page);
  // The worker's Auth instance learns of a page sign-in by polling IndexedDB, so
  // a navigation right after it can legitimately carry no token yet.
  await expect(async () => {
    await page.goto("/profile");
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
      account.email,
    );
    expect(forwarded.at(-1)).toMatch(/^Bearer ./);
  }).toPass({ timeout: 15_000 });
});

test("a failed token refresh does not block navigation or loop", async ({
  context,
  page,
  request,
}) => {
  const account = await createAccount(request, "refresh-failure");
  await signIn(page, account.email);
  await expect(page).toHaveURL("/");
  await waitForActiveWorker(page);

  await context.route("**/securetoken.googleapis.com/**", (route) =>
    route.abort("failed"),
  );
  await page.goto("/profile");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    account.email,
  );
  await expect(page).toHaveURL(`${authTestOrigin}/profile`);
  await context.unrouteAll();
});

test("sign-out ends protected access, including history navigation", async ({
  page,
  request,
}) => {
  const account = await createAccount(request, "sign-out");
  await signIn(page, account.email);
  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: "My profile" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    account.email,
  );
  await page.getByRole("link", { name: "Back to Home" }).click();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === "/sign-in" &&
      url.searchParams.get("next") === "/profile",
  );
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);

  await page.goto("/profile");
  await expect(page).toHaveURL(`${authTestOrigin}${signInUrlTo("/profile")}`);
});

test("switching accounts shows only the new account", async ({
  page,
  request,
}) => {
  const first = await createAccount(request, "switch-first");
  const second = await createAccount(request, "switch-second");

  await signIn(page, first.email, signInUrlTo("/profile"));
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    first.email,
  );
  await page.getByLabel("Name", { exact: true }).fill("First Account");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByText("Profile saved")).toBeVisible();

  await page.getByRole("link", { name: "Back to Home" }).click();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();

  await signIn(page, second.email, signInUrlTo("/profile"));
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    second.email,
  );
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
});

test("Firestore Rules follow the role claim of the presented token", async ({
  request,
}) => {
  const owner = await createAccount(request, "claims-owner");
  const reader = await createAccount(request, "claims-reader");
  const documentUrl = `${firestoreEmulatorOrigin}/v1/projects/${project}/databases/(default)/documents/users/${owner.localId}`;
  const read = async (idToken: string) =>
    (
      await request.get(documentUrl, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
    ).status();

  const saved = await request.patch(documentUrl, {
    headers: { Authorization: `Bearer ${owner.idToken}` },
    data: { fields: { theme: { stringValue: "dark" } } },
  });
  expect(saved.ok()).toBe(true);
  expect(await read(reader.idToken), "a plain user is denied").toBe(403);

  await updateAccount(request, reader.localId, {
    customAttributes: JSON.stringify({ role: "admin" }),
  });
  expect(await read(reader.idToken), "the old token has no new claim").toBe(
    403,
  );
  const adminToken = await refreshIdToken(request, reader.refreshToken);
  expect(await read(adminToken), "a refreshed token carries the claim").toBe(
    200,
  );

  await updateAccount(request, reader.localId, {
    customAttributes: JSON.stringify({}),
  });
  const demotedToken = await refreshIdToken(request, reader.refreshToken);
  expect(await read(demotedToken), "demotion applies to a new token").toBe(403);
  // Rules do not check revocation: an issued admin token stays valid there until
  // it expires. Only `verifyIdToken(token, true)` rejects it earlier.
  expect(await read(adminToken), "documented Rules limitation").toBe(200);
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
  await signInEmail(page).fill(email);
  await signInPassword(page).fill(password);
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
      await signInEmail(page).fill(email);
      await signInPassword(page).fill(password);
      await page.getByRole("button", { name: "Sign In", exact: true }).click();
      await expect(page).toHaveURL("/");
      await page.goto("/profile");
      await expect(page.getByLabel("Language", { exact: true })).toBeVisible();

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
