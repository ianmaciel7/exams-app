import { expect, test } from "@playwright/test";
import { createObject, createSpace, signUp } from "./helpers";

const protectedRoutes = [
  "/space",
  "/question",
  "/study",
  "/review",
  "/settings",
];

test("every space route bounces an unauthenticated visitor to /login", async ({
  page,
}) => {
  for (const route of protectedRoutes) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("a signed-in caller is redirected away from /login", async ({ page }) => {
  await signUp(page);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/space$/);
});

test("another Space's object answers 404, never 403", async ({
  page,
  browser,
}) => {
  await signUp(page);
  await createSpace(page, "Owner space");
  const objectId = await createObject(page, {
    kind: "note",
    title: "Private to the first Space",
    text: "Should be invisible to anyone else.",
  });

  // A second user, in their own Space, guessing the first user's object id.
  const outsider = await browser.newContext();
  const outsiderPage = await outsider.newPage();
  await signUp(outsiderPage);
  await createSpace(outsiderPage, "Outsider space");
  await outsiderPage.goto(`/question/${objectId}`);

  await expect(outsiderPage.getByText("We can't find that.")).toBeVisible();
  await expect(
    outsiderPage.getByText("Private to the first Space"),
  ).toHaveCount(0);
  await outsider.close();
});
