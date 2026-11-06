// cspell:ignore connectionrefused requestfailed
import { once } from "node:events";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import {
  type APIRequestContext,
  expect,
  type Page,
  type Response,
  test,
} from "@playwright/test";

const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const password = process.env.TEST_USER_PASSWORD;
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const functionsHost = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST;
if (!project?.startsWith("demo-") || !password || !authHost || !functionsHost) {
  throw new Error(
    "Usage integration tests require a demo project and emulator endpoints.",
  );
}
const authOrigin = new URL(
  authHost.includes("://") ? authHost : `http://${authHost}`,
).origin;
const functionsOrigin = new URL(
  functionsHost.includes("://") ? functionsHost : `http://${functionsHost}`,
).origin;
const callableUrl = `${functionsOrigin}/${project}/us-central1/recordUsage`;
const profileEvent = { type: "screen_view", name: "/profile" };
const eventIdPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/;

async function createAccount(request: APIRequestContext) {
  const email = `usage-${crypto.randomUUID()}@example.test`;
  const response = await request.post(
    `${authOrigin}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(response.ok(), "Auth emulator must create the test identity").toBe(
    true,
  );
  const account = (await response.json()) as { idToken: string };
  return { email, idToken: account.idToken };
}

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.locator('input[autocomplete="username"]').fill(email);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill(password ?? "");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL("/");
}

function isProfileUsage(response: Response) {
  const request = response.request();
  return (
    response.url() === callableUrl &&
    request.method() === "POST" &&
    request.postDataJSON()?.data?.name === "/profile"
  );
}

async function expectUsageAcknowledgment(response: Response) {
  expect(
    response.status(),
    "recordUsage must execute, not merely render the profile",
  ).toBe(200);
  expect((await response.json()).result.eventId).toMatch(eventIdPattern);
}

test.beforeAll(async ({ request }) => {
  test.setTimeout(180_000);
  for (const route of ["/sign-in", "/", "/profile"]) {
    await request.get(route, { timeout: 120_000 });
  }
});

for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000"]) {
  test(`usage callable accepts the browser preflight from ${origin}`, async ({
    request,
  }) => {
    const response = await request.fetch(callableUrl, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
      },
    });
    expect(
      response.status(),
      "a missing or unloaded callable must fail this test",
    ).toBe(204);
    const headers = response.headers();
    expect(headers["access-control-allow-origin"]).toBe(origin);
    expect(headers["access-control-allow-methods"].split(/\s*,\s*/)).toContain(
      "POST",
    );
    expect(
      headers["access-control-allow-headers"].toLowerCase().split(/\s*,\s*/),
    ).toEqual(expect.arrayContaining(["authorization", "content-type"]));
  });
}

for (const authorization of [undefined, "NotBearer invalid-token"]) {
  test(`usage callable rejects ${authorization ? "malformed" : "missing"} authentication with readable CORS errors`, async ({
    request,
  }) => {
    const origin = "http://localhost:3000";
    const response = await request.post(callableUrl, {
      headers: {
        Origin: origin,
        ...(authorization ? { Authorization: authorization } : {}),
      },
      data: { data: profileEvent },
    });
    expect(response.status()).toBe(401);
    expect(response.headers()["access-control-allow-origin"]).toBe(origin);
    expect((await response.json()).error.status).toBe("UNAUTHENTICATED");
  });
}

test("callable SDK rejects invalid tokens without the emulator verification shortcut", async ({
  request,
}) => {
  // Firebase CLI enables skipTokenVerification inside its Functions workers.
  // Load the actual export in this test worker, where that shortcut is off.
  expect(process.env.FIREBASE_DEBUG_MODE).not.toBe("true");
  const requireFunctions = createRequire(resolve("functions/index.js"));
  const { recordUsage } = requireFunctions("./index.js");
  const express = requireFunctions("express");
  const app = express();
  app.use(express.json());
  app.post("/recordUsage", recordUsage);
  const server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Missing test server address");
    const origin = "http://localhost:3000";
    const response = await request.post(
      `http://127.0.0.1:${address.port}/recordUsage`,
      {
        headers: { Origin: origin, Authorization: "Bearer invalid-token" },
        data: { data: profileEvent },
      },
    );
    expect(response.status()).toBe(401);
    expect(response.headers()["access-control-allow-origin"]).toBe(origin);
    expect((await response.json()).error.status).toBe("UNAUTHENTICATED");
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("usage callable validates authenticated payloads and acknowledges approved events", async ({
  request,
}) => {
  const { idToken } = await createAccount(request);
  const headers = { Authorization: `Bearer ${idToken}` };
  const rejected = await request.post(callableUrl, {
    headers,
    data: { data: { ...profileEvent, uid: "spoofed-user" } },
  });
  expect(rejected.status()).toBe(400);
  expect((await rejected.json()).error.status).toBe("INVALID_ARGUMENT");
  for (const data of [
    profileEvent,
    { type: "function_use", name: "profile.update" },
  ]) {
    const accepted = await request.post(callableUrl, {
      headers,
      data: { data },
    });
    expect(accepted.status()).toBe(200);
    expect((await accepted.json()).result.eventId).toMatch(eventIdPattern);
  }
});

test("usage callable works through browser CORS for authentication errors and successful events", async ({
  page,
  request,
}) => {
  const { idToken } = await createAccount(request);
  await page.goto("/sign-in");
  // APIRequestContext does not enforce CORS. This fetch runs in Chromium.
  const results = await page.evaluate(
    async ({ url, token, event }) => {
      const results = [];
      for (const authorization of [undefined, `Bearer ${token}`]) {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authorization ? { Authorization: authorization } : {}),
          },
          body: JSON.stringify({ data: event }),
        });
        results.push({ status: response.status, body: await response.json() });
      }
      return results;
    },
    { url: callableUrl, token: idToken, event: profileEvent },
  );
  expect(results[0].status).toBe(401);
  expect(results[0].body.error.status).toBe("UNAUTHENTICATED");
  expect(results[1].status).toBe(200);
  expect(results[1].body.result.eventId).toMatch(eventIdPattern);
});

test("profile navigation receives a real usage acknowledgment", async ({
  page,
  request,
}) => {
  const { email } = await createAccount(request);
  await signIn(page, email);
  const acknowledgment = page.waitForResponse(isProfileUsage);
  await page.getByRole("link", { name: "My profile" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
  await expectUsageAcknowledgment(await acknowledgment);
});

test("usage outage leaves the profile usable and the next navigation records usage again", async ({
  page,
  request,
}) => {
  const { email } = await createAccount(request);
  await signIn(page, email);
  await page.route(callableUrl, (route) => route.abort("connectionrefused"));
  const failure = page.waitForEvent(
    "requestfailed",
    (request) => request.url() === callableUrl,
  );
  await page.getByRole("link", { name: "My profile" }).click();
  await failure;
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
  await expect(
    page.getByRole("button", { name: "Save profile", exact: true }),
  ).toBeEnabled();
  await page.unroute(callableUrl);
  await page.getByRole("link", { name: "Back to Home" }).click();
  const acknowledgment = page.waitForResponse(isProfileUsage);
  await page.getByRole("link", { name: "My profile" }).click();
  await expectUsageAcknowledgment(await acknowledgment);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
});
