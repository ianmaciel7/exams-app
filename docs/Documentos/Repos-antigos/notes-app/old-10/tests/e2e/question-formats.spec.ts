import { expect, test } from "@playwright/test";
import {
  createObject,
  createSpace,
  signUp,
  startSession,
  visit,
} from "./helpers";

test("multiple-choice questions grade the complete selected set", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Multiple choice");
  await createObject(page, {
    kind: "question",
    title: "Select prime numbers",
    text: "Choose every prime.",
    format: "multiple-choice",
    options: "2\n3\n4",
    answers: "2\n3",
  });

  await startSession(page, "all", "practice");
  await page.getByRole("checkbox", { name: "2", exact: true }).check();
  await page.getByRole("checkbox", { name: "3", exact: true }).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("That's right.")).toBeVisible();
});

test("fill-blank questions accept a configured answer", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "Fill blank");
  await createObject(page, {
    kind: "question",
    title: "Cell powerhouse",
    text: "Name the organelle.",
    format: "fill-blank",
    answers: "mitochondria\nmitochondrion",
  });

  await startSession(page, "all", "practice");
  await page.locator("#answer").fill("Mitochondrion");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("That's right.")).toBeVisible();
});

test("matching questions grade answers in prompt order", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "Matching");
  await createObject(page, {
    kind: "question",
    title: "Match capitals",
    text: "Match country to capital.",
    format: "matching",
    options: "France\nBrazil",
    answers: "Paris\nBrasília",
  });

  await startSession(page, "all", "practice");
  await page.locator("#match-0").fill("Paris");
  await page.locator("#match-1").fill("Brasília");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("That's right.")).toBeVisible();
});

test("a multi-question practice session advances, finishes, and restarts", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Multi question");
  await createObject(page, {
    kind: "question",
    title: "Question one",
    text: "First.",
    options: "A\nB",
    answers: "A",
  });
  await createObject(page, {
    kind: "question",
    title: "Question two",
    text: "Second.",
    options: "A\nB",
    answers: "A",
  });

  await startSession(page, "all", "practice", "2");
  await expect(page.getByText(/Question 1 of 2/)).toBeVisible();
  await page.getByRole("radio", { name: "A", exact: true }).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page.getByRole("button", { name: "Next question" }).click();

  await expect(page.getByText(/Question 2 of 2/)).toBeVisible();
  await page.getByRole("radio", { name: "A", exact: true }).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page.getByRole("button", { name: "View results" }).click();

  await expect(page.getByText("Session complete")).toBeVisible();
  await expect(page.getByText("2 of 2 correct.")).toBeVisible();
  await page.getByRole("button", { name: "Start another session" }).click();
  await expect(
    page.getByRole("button", { name: "Begin session" }),
  ).toBeVisible();
});

test("an expired exam exposes the saved-answer fallback after an automatic submit fails", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Expiry");
  await createObject(page, {
    kind: "question",
    title: "Expiry question",
    text: "Saved before expiry.",
    options: "A\nB",
    answers: "A",
  });

  await visit(page, "/study");
  await page.locator("#scope").selectOption("all");
  await page.locator("#count").fill("1");
  await page.locator("#mode").selectOption("simulated_exam");
  await page.locator("#duration").fill("5");
  await page.getByRole("button", { name: "Begin session" }).click();
  await page.getByRole("radio", { name: "A", exact: true }).check();

  let blocked = false;
  await page.route("**/*", async (route) => {
    if (!blocked && route.request().method() === "POST") {
      blocked = true;
      await route.abort();
      return;
    }
    await route.continue();
  });
  await page.evaluate(() => {
    const realNow = Date.now.bind(Date);
    Date.now = () => realNow() + 6 * 60 * 1000;
  });

  await expect(
    page.getByRole("button", { name: "Submit saved answers" }),
  ).toBeVisible({ timeout: 10_000 });
  await page.unroute("**/*");
  await page.getByRole("button", { name: "Submit saved answers" }).click();
  await expect(page.getByText("Session complete")).toBeVisible();
});
