// cspell:ignore networkidle
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// Platform hygiene that Lighthouse and the Next.js production checklist expect
// from every deployment.

test("sends baseline security headers and hides the framework banner", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const headers = response.headers();
  expect(headers["x-powered-by"]).toBeUndefined();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy"]).toContain("frame-ancestors");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["strict-transport-security"]).toContain("max-age=");
});

test("enforces a per-request nonce CSP on every script", async ({
  request,
}) => {
  const [first, second] = await Promise.all([
    request.get("/sign-in"),
    request.get("/sign-in"),
  ]);
  const policy = first.headers()["content-security-policy"];
  const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  expect(policy).toContain("'strict-dynamic'");
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("base-uri 'none'");
  expect(policy).not.toContain("'unsafe-eval'");
  expect(second.headers()["content-security-policy"]).not.toContain(
    `'nonce-${nonce}'`,
  );

  // Browsers hide the nonce attribute from the DOM, so check the raw HTML.
  const scripts = (await first.text()).match(/<script\b[^>]*>/g) ?? [];
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) expect(script).toContain(`nonce="${nonce}"`);
});

for (const path of ["/", "/sign-in", "/register", "/forgot-password"]) {
  test(`renders ${path} without CSP violations`, async ({ page }) => {
    await page.addInitScript(() => {
      const violations: string[] = [];
      Object.assign(window, { cspViolations: violations });
      document.addEventListener("securitypolicyviolation", (event) =>
        violations.push(`${event.violatedDirective} ${event.blockedURI}`),
      );
    });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const violations = await page.evaluate(
      () => (window as unknown as { cspViolations: string[] }).cspViolations,
    );
    expect(violations).toEqual([]);
  });
}

test("starts the Firebase auth service worker under the page CSP", async ({
  context,
  page,
}) => {
  // Serve the worker's gstatic imports from the installed SDK, so the check
  // depends on the policy and not on the network.
  const sdk = join(process.cwd(), "node_modules", "firebase");
  await context.route(
    "https://www.gstatic.com/firebasejs/**",
    async (route) => {
      const file = new URL(route.request().url()).pathname.split("/").pop();
      await route.fulfill({
        contentType: "text/javascript",
        headers: { "access-control-allow-origin": "*" },
        body: await readFile(join(sdk, file ?? "")),
      });
    },
  );
  await page.goto("/sign-in");
  const result = await page.evaluate(async () => {
    try {
      await navigator.serviceWorker.register("/firebase-auth-sw.js", {
        scope: "/",
        type: "module",
      });
      await navigator.serviceWorker.ready;
      return "active";
    } catch (cause) {
      return String(cause);
    }
  });
  expect(result).toBe("active");
});

test("serves an installable web app manifest", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.short_name).toBeTruthy();
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.length).toBeGreaterThan(0);
});

test("describes the page for search and link previews", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /.+/,
  );
  await expect(page.locator("meta[charset], meta[charSet]")).toHaveCount(1);
});

test("applies the Base UI portal setup to the document", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("position", "relative");
  await expect(page.locator('body > [data-slot="app-root"]')).toHaveCSS(
    "isolation",
    "isolate",
  );
});
