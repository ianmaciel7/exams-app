import { expect, test } from "@playwright/test";
import { createObject, createSpace, ensure, signUp, visit } from "./helpers";

test("editing and saving an existing object updates its detail view", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Editing");
  await createObject(page, {
    kind: "note",
    title: "Before edit",
    text: "Original content.",
  });

  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.locator("#title").fill("After edit");
  await page.getByRole("button", { name: "Save object" }).click();

  await expect(page.getByRole("heading", { name: "After edit" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit", exact: true }),
  ).toBeVisible();
});

test("a citation persists and renders its source URL", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "Citations");
  const source = "https://example.com/reference";
  await createObject(page, {
    kind: "citation",
    title: "Reference source",
    text: "A cited source.",
    url: source,
  });

  const link = page.getByRole("link", { name: source });
  await expect(link).toHaveAttribute("href", source);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noreferrer/);
});

test("the context Details tab exposes object metadata", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "Details");
  await createObject(page, {
    kind: "note",
    title: "Metadata note",
    text: "Metadata.",
  });

  await page.getByRole("tab", { name: "Details" }).click();
  const panel = page.getByRole("tabpanel").filter({ hasText: "Revision" });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Type");
  await expect(panel).toContainText("note");
  await expect(panel).toContainText("Revision");
  await expect(panel).toContainText("1");
  await expect(panel).toContainText("Updated");
});

test("clicking the mobile navigation backdrop closes the drawer and restores focus", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Mobile close");
  await page.setViewportSize({ width: 600, height: 900 });
  await page.goto("/space");

  const opener = page.getByRole("button", { name: "Open navigation" });
  const nav = page.getByRole("complementary", { name: "Space navigation" });
  await ensure(nav, () => opener.click());

  await page.getByRole("button", { name: "Close navigation" }).click({
    position: { x: 590, y: 450 },
  });
  await expect(nav).toBeHidden();
  await expect(opener).toBeFocused();
});

test("the command palette exposes every navigation action and New object", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Palette actions");
  await visit(page, "/space");

  const actions = [
    { name: "Go to Questions", path: "/question" },
    { name: "Go to Study session", path: "/study" },
    { name: "Go to Review queue", path: "/review" },
    { name: "Go to Settings", path: "/settings" },
    { name: "Go to Overview", path: "/space" },
  ] as const;

  const palette = page.getByPlaceholder("Search objects, or jump to a section");

  for (const action of actions) {
    await ensure(palette, () =>
      page.getByRole("button", { name: "Search space" }).click(),
    );
    await page.getByRole("option", { name: action.name }).click();
    await page.waitForURL(`**${action.path}`);
  }

  await ensure(palette, () =>
    page.getByRole("button", { name: "Search space" }).click(),
  );
  await page.getByRole("option", { name: "New object" }).click();
  await expect(
    page.getByRole("heading", { name: "Add to your Space" }),
  ).toBeVisible();
});

test("Google sign-in opens the Firebase Auth Emulator provider page", async ({
  page,
}) => {
  await page.goto("/login");

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  await expect(popup).toHaveURL(/(?:127\.0\.0\.1|localhost):9099/);
  await popup.close();
});

test("landing page CTAs have real destinations instead of inert buttons", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Search" })).toHaveCount(0);
  await expect(
    page.locator('a[href="#space"]').filter({ hasText: "See how it works" }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/login"]').filter({ hasText: "Sign in" }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/login"]').filter({ hasText: "Create a space" }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/space"]').filter({ hasText: "Open space" }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/space"]').filter({ hasText: "Open Recall" }),
  ).toBeVisible();
});
