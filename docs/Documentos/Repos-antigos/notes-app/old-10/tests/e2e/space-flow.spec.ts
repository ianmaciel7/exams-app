import { expect, test } from "@playwright/test";
import {
  createObject,
  createSpace,
  ensure,
  signUp,
  startSession,
  visit,
} from "./helpers";

test("a question links to a note, and the note shows the backlink", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Biology");

  const noteId = await createObject(page, {
    kind: "note",
    title: "Mitochondria",
    text: "The powerhouse of the cell.",
  });
  const questionId = await createObject(page, {
    kind: "question",
    title: "What powers the cell?",
    text: "Recall the organelle.",
    options: "Nucleus\nMitochondria",
    answers: "Mitochondria",
    links: [noteId],
  });

  await expect(
    page.getByRole("heading", { name: "What powers the cell?" }),
  ).toBeVisible();
  await page.locator(`a[href="/question/${noteId}"]`).first().click();
  await page.waitForURL(`**/question/${noteId}`);

  // The edge was only ever written from the question's side; the note's
  // backlinks panel has to derive it in the other direction (FR-8).
  await expect(
    page.getByRole("heading", { name: "Mitochondria" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Backlinks/ }).click();
  await expect(
    page.locator(`a[href="/question/${questionId}"]`).first(),
  ).toBeVisible();
});

test("practice mode grades an answer and takes a 0-5 self-grade", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Arithmetic");
  await createObject(page, {
    kind: "question",
    title: "What is 2 + 2?",
    text: "Basic arithmetic.",
    options: "3\n4\n5",
    answers: "4",
  });

  await startSession(page, "due", "practice");

  await expect(page.getByText("What is 2 + 2?")).toBeVisible();
  await page.getByRole("radio", { name: "4", exact: true }).check();
  await page.getByRole("button", { name: "Check answer" }).click();

  await expect(page.getByText("That's right.")).toBeVisible();
  await expect(page.getByText("How well did you recall this?")).toBeVisible();
  await page.getByRole("button", { name: "Perfect" }).click();
  await expect(page.getByText("Review schedule updated.")).toBeVisible();
});

test("a simulated exam hides feedback and submits on the deadline", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Exam space");
  await createObject(page, {
    kind: "question",
    title: "Capital of France?",
    text: "Geography.",
    options: "Paris\nLyon",
    answers: "Paris",
  });

  await startSession(page, "due", "simulated_exam");

  await expect(page.getByText(/seconds left/)).toBeVisible();
  await page.getByRole("radio", { name: "Paris", exact: true }).check();
  await page.getByRole("button", { name: "Save and finish exam" }).click();

  // No per-question reveal in exam mode — the score only appears at the end.
  await expect(page.getByText("Session complete")).toBeVisible();
  await expect(page.getByText("1 of 1 correct.")).toBeVisible();
});

test("archiving an object removes it from the review scope", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Archive space");
  await createObject(page, {
    kind: "question",
    title: "Throwaway question",
    text: "To be archived.",
    options: "a\nb",
    answers: "a",
  });

  await visit(page, "/question");
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(page.getByText("Archived")).toBeVisible();

  await startSession(page, "all", "practice");
  await expect(page.getByText("No questions match this scope")).toBeVisible();
});

test("rich text formatting survives a save and renders on the detail view", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Formatting");

  await ensure(page.getByRole("heading", { name: "Add to your Space" }), () =>
    page.getByRole("button", { name: "New object" }).click(),
  );
  await page.locator("#kind").selectOption("note");
  await page.locator("#title").fill("Formatted note");

  const editor = page.locator('[contenteditable="true"]');
  const items = page.locator('[contenteditable="true"] li');
  await editor.click();
  await editor.pressSequentially("- first item");
  await editor.press("Enter");
  await editor.pressSequentially("second item");

  // Typing after the input rule built the list must not revert it: the editor
  // owns its document, so nothing re-applies the parent's copy on a keystroke.
  await expect(items).toHaveCount(2);

  await editor.selectText();
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(editor.locator("strong")).not.toHaveCount(0);

  await page.getByRole("button", { name: "Save object" }).click();
  await page.waitForURL(/\/question\/[^/]+$/);

  await expect(page.locator(".rich-text li")).toHaveCount(2);
  await expect(page.locator(".rich-text li").first()).toHaveText("first item");
  await expect(page.locator(".rich-text strong")).not.toHaveCount(0);

  // And it is the stored document, not editor state carried across the push.
  await page.reload();
  await expect(page.locator(".rich-text li")).toHaveCount(2);
  await expect(page.locator(".rich-text strong")).toHaveCount(1);
});

test("the command palette finds an object and navigates to it", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Palette");
  const noteId = await createObject(page, {
    kind: "note",
    title: "Photosynthesis basics",
    text: "Light to chemical energy.",
  });
  await visit(page, "/space");

  await page.keyboard.press("ControlOrMeta+k");
  const search = page.getByPlaceholder("Search objects, or jump to a section");
  await expect(search).toBeVisible();

  await search.fill("photosynth");
  await page.getByRole("option", { name: /Photosynthesis basics/ }).click();
  await page.waitForURL(`**/question/${noteId}`);
  await expect(
    page.getByRole("heading", { name: "Photosynthesis basics" }),
  ).toBeVisible();
});
