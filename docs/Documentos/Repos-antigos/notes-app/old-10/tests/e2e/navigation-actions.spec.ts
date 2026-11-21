import { expect, test } from "@playwright/test";
import { createSpace, signUp, visit } from "./helpers";

test("primary Space navigation reaches every destination", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "Navigation");
  await visit(page, "/space");

  const destinations = [
    { name: "Questions", path: "/question", heading: "Questions" },
    { name: "Study session", path: "/study", heading: "Study session" },
    { name: "Review queue", path: "/review", heading: "Review queue" },
    { name: "Settings", path: "/settings", heading: "Settings" },
    { name: "Overview", path: "/space", heading: "Overview" },
  ] as const;

  for (const destination of destinations) {
    await page
      .getByRole("link", { name: destination.name, exact: true })
      .click();
    await page.waitForURL(`**${destination.path}`);
    await expect(
      page.getByRole("heading", { name: destination.heading, exact: true }),
    ).toBeVisible();
  }
});

test("sign out returns to login and protected navigation no longer remains", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Logout Space");
  await visit(page, "/space");

  await page
    .locator("aside")
    .getByRole("button", { name: "Sign out", exact: true })
    .click();
  await page.waitForURL("**/login");
  await expect(page.getByText("Welcome back", { exact: true })).toBeVisible({
    timeout: 60_000,
  });

  await page.goto("/space");
  await page.waitForURL("**/login");
});

test("New object can be opened and dismissed without creating anything", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Object creation");
  await visit(page, "/space");

  await page
    .locator("header")
    .getByRole("button", { name: "New object", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Add to your Space" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("heading", { name: "Add to your Space" }),
  ).toBeHidden();

  await page.getByRole("link", { name: "Questions", exact: true }).click();
  await expect(
    page.getByText('No objects yet. Use "New object" above', { exact: false }),
  ).toBeVisible();
});
