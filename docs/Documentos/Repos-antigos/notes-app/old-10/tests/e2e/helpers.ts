import { expect, type Locator, type Page } from "@playwright/test";

let seq = 0;

export async function ensure(settled: Locator, action: () => Promise<void>) {
  await expect(async () => {
    if (!(await settled.isVisible())) await action();
    await expect(settled).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 60_000 });
}

async function waitHydrated(page: Page) {
  const menuItem = page.getByRole("menuitem", { name: "New Space" });
  await ensure(menuItem, async () => {
    await page.locator('[aria-haspopup="menu"]').first().click();
  });
  await page.keyboard.press("Escape");
  await expect(menuItem).toBeHidden();
}

export async function visit(page: Page, path: string) {
  await page.goto(path);
  await waitHydrated(page);
}

export async function signUp(page: Page) {
  const email = `e2e-${Date.now()}-${seq++}@example.com`;
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Create account" });
  await ensure(submit, async () => {
    await page
      .getByRole("button", { name: "New here? Create an account" })
      .click();
  });
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("test-password-123");
  await submit.click();
  await page.waitForURL("**/space", { timeout: 60_000 });
  return email;
}

export async function createSpace(page: Page, name: string) {
  const menuItem = page.getByRole("menuitem", { name: "New Space" });
  await ensure(menuItem, async () => {
    await page.locator('[aria-haspopup="menu"]').first().click();
  });
  await menuItem.click();
  await page.locator("#space-name").fill(name);
  await page.getByRole("button", { name: "Create Space", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Create a Space", exact: true }),
  ).toBeHidden({ timeout: 60_000 });
  await page.reload();
  await waitHydrated(page);
  await expect(page.locator('[aria-haspopup="menu"]').first()).toContainText(
    name,
    { timeout: 60_000 },
  );
}

export async function createObject(
  page: Page,
  fields: {
    kind: string;
    title: string;
    text?: string;
    url?: string;
    format?: "single-choice" | "multiple-choice" | "fill-blank" | "matching";
    options?: string;
    answers?: string;
    links?: string[];
  },
) {
  const heading = page.getByRole("heading", { name: "Add to your Space" });
  await ensure(heading, async () => {
    await page.getByRole("button", { name: "New object" }).click();
  });
  await page.locator("#kind").selectOption(fields.kind);
  await page.locator("#title").fill(fields.title);
  if (fields.text)
    await page.locator('[contenteditable="true"]').fill(fields.text);
  if (fields.url) await page.locator("#url").fill(fields.url);
  if (fields.format) await page.locator("#format").selectOption(fields.format);
  if (fields.options) await page.locator("#options").fill(fields.options);
  if (fields.answers) await page.locator("#answers").fill(fields.answers);
  if (fields.links) await page.locator("#links").selectOption(fields.links);
  const previous = page.url();
  await page.getByRole("button", { name: "Save object" }).click();
  await page.waitForURL(
    (url) => url.pathname.startsWith("/question/") && url.href !== previous,
  );
  return page.url().split("/").pop() as string;
}

export async function startSession(
  page: Page,
  scope: string,
  mode: "practice" | "simulated_exam",
  count = "1",
) {
  await visit(page, "/study");
  await page.locator("#scope").selectOption(scope);
  await page.locator("#count").fill(count);
  await page.locator("#mode").selectOption(mode);
  await page.getByRole("button", { name: "Begin session" }).click();
}
