import { expect, test } from "@playwright/test";
import { createObject, createSpace, ensure, signUp, visit } from "./helpers";

test("login mode buttons switch between sign in and account creation", async ({
  page,
}) => {
  await page.goto("/login");

  const createHeading = page.getByText("Create your account", {
    exact: true,
  });
  await ensure(createHeading, () =>
    page.getByRole("button", { name: "New here? Create an account" }).click(),
  );
  await expect(
    page.getByRole("button", { name: "Create account" }),
  ).toBeVisible();

  const welcomeHeading = page.getByText("Welcome back", {
    exact: true,
  });
  await ensure(welcomeHeading, () =>
    page
      .getByRole("button", {
        name: "Already have an account? Sign in",
        exact: true,
      })
      .click(),
  );
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("object edit cancel protects dirty changes and archive can be restored", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Object actions");
  await createObject(page, {
    kind: "note",
    title: "Action note",
    text: "Original body.",
  });

  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Edit object" }),
  ).toBeVisible();

  await page.locator("#title").fill("Unsaved title");
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe("Discard your unsaved changes?");
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("heading", { name: "Edit object" }),
  ).toBeVisible();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe("Discard your unsaved changes?");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading", { name: "Edit object" })).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Action note" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByText("Archived", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();

  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText("Archived", { exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: "Archive" })).toBeVisible();
});

test("API key buttons generate, copy, and revoke a key", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await signUp(page);
  await createSpace(page, "API buttons");
  await visit(page, "/settings");

  await page.locator("#key-label").fill("Playwright client");
  await page.getByRole("button", { name: "Generate key" }).click();

  const issued = page.getByTestId("issued-key");
  await expect(issued).toBeVisible();
  const rawKey = (await issued.textContent())?.trim();
  expect(rawKey).toMatch(/^rcl_live_/);

  await page.getByRole("button", { name: "Copy" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(rawKey);

  await expect(
    page.getByText("Playwright client", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText("Revoked", { exact: true })).toBeVisible();
});
