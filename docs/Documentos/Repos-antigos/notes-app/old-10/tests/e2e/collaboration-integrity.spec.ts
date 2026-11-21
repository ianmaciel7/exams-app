import { expect, test } from "@playwright/test";
import { createObject, createSpace, ensure, signUp, visit } from "./helpers";

test("an owner can invite a member, the member can report, and the owner can resolve", async ({
  page,
  browser,
}) => {
  await signUp(page);
  await createSpace(page, "Shared Space");
  const objectId = await createObject(page, {
    kind: "note",
    title: "Shared note",
    text: "Visible to invited members.",
  });

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  const memberEmail = await signUp(memberPage);

  await page.locator('[aria-haspopup="menu"]').first().click();
  await page.getByRole("menuitem", { name: "Invite a member" }).click();
  await page.locator("#invite-email").fill(memberEmail);
  await page.getByRole("button", { name: "Add member" }).click();
  await expect(
    page.getByRole("heading", { name: "Invite a member" }),
  ).toBeHidden();

  await memberPage.goto("/space");
  await expect(
    memberPage.getByRole("button", { name: "Shared Space" }),
  ).toBeVisible();
  await memberPage.goto(`/question/${objectId}`);
  await expect(
    memberPage.getByRole("heading", { name: "Shared note" }),
  ).toBeVisible();

  await memberPage.getByRole("button", { name: "Report" }).click();
  await expect(memberPage.getByText("We can't find that.")).toBeVisible();

  await page.goto(`/question/${objectId}`);
  await expect(page.getByText("Reported", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Resolve report" }).click();
  await expect(page.getByText("Reported", { exact: true })).toBeHidden();

  await memberPage.goto(`/question/${objectId}`);
  await expect(
    memberPage.getByRole("heading", { name: "Shared note" }),
  ).toBeVisible();
  await memberContext.close();
});

test("switching Spaces changes the visible object set", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "Space Alpha");
  await createObject(page, {
    kind: "note",
    title: "Alpha only",
    text: "Alpha.",
  });

  await createSpace(page, "Space Beta");
  await createObject(page, {
    kind: "note",
    title: "Beta only",
    text: "Beta.",
  });
  await visit(page, "/question");
  await expect(page.getByRole("link", { name: "Beta only" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Alpha only" })).toHaveCount(0);

  await page.locator('[aria-haspopup="menu"]').first().click();
  await page.getByRole("menuitem", { name: "Space Alpha" }).click();
  await expect(page.getByRole("link", { name: "Alpha only" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Beta only" })).toHaveCount(0);

  await page.locator('[aria-haspopup="menu"]').first().click();
  await page.getByRole("menuitem", { name: "Space Beta" }).click();
  await expect(page.getByRole("link", { name: "Beta only" })).toBeVisible();
});

test("saving a stale editor preserves the draft and reports a version conflict", async ({
  page,
  context,
}) => {
  await signUp(page);
  await createSpace(page, "Concurrency");
  const id = await createObject(page, {
    kind: "note",
    title: "Concurrent note",
    text: "Original.",
  });

  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.locator("#title").fill("Stale draft");

  const fresh = await context.newPage();
  await fresh.goto(`/question/${id}`);
  const freshEditor = fresh.getByRole("heading", { name: "Edit object" });
  await ensure(freshEditor, () =>
    fresh.getByRole("button", { name: "Edit", exact: true }).click(),
  );
  await fresh.locator("#title").fill("Fresh save");
  await fresh.getByRole("button", { name: "Save object" }).click();
  await expect(
    fresh.getByRole("heading", { name: "Fresh save" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Save object" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "This object changed. Reload before saving; your draft is still here.",
  );
  await expect(page.locator("#title")).toHaveValue("Stale draft");
  await fresh.close();
});

test("a user cannot own a second exam", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "Exam ownership");
  await createObject(page, {
    kind: "exam",
    title: "Primary exam",
  });

  await page.getByRole("button", { name: "New object" }).click();
  await page.locator("#kind").selectOption("exam");
  await page.locator("#title").fill("Second exam");
  await page.getByRole("button", { name: "Save object" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "You can own one exam. Edit your existing exam instead.",
  );
  await expect(
    page.getByRole("heading", { name: "Add to your Space" }),
  ).toBeVisible();
});

test("the server rejects a link to an object from another Space", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Source Space");
  const foreignId = await createObject(page, {
    kind: "note",
    title: "Foreign object",
    text: "Must not be linkable from another Space.",
  });

  await createSpace(page, "Target Space");
  await page.getByRole("button", { name: "New object" }).click();
  await page.locator("#kind").selectOption("note");
  await page.locator("#title").fill("Cross-space attempt");

  await page.locator("#links").evaluate((select, value) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = "Injected foreign object";
    option.selected = true;
    select.append(option);
  }, foreignId);

  await page.getByRole("button", { name: "Save object" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "A linked object is unavailable in this Space.",
  );
});
