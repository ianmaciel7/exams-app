import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import {
  createObject,
  createSpace,
  signUp,
  startSession,
  visit,
} from "./helpers";

// spec.md NFR-3 (WCAG 2.1 AA) and §11's "an accessibility (axe) pass" item.
// Scoped to the WCAG 2.1 A/AA rule sets axe-core ships, matching NFR-3's own
// wording rather than pulling in axe's broader "best-practice" rules, which
// are not part of the WCAG standard this requirement cites.
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function describeViolations(
  results: Awaited<ReturnType<AxeBuilder["analyze"]>>,
) {
  return results.violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n${violation.nodes
          .map((node) => `  - ${node.target.join(" ")}`)
          .join("\n")}`,
    )
    .join("\n\n");
}

async function expectNoViolations(page: Page, knownIssues: string[] = []) {
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  const violations = results.violations.filter(
    (violation) => !knownIssues.includes(violation.id),
  );
  expect(violations, describeViolations({ ...results, violations })).toEqual(
    [],
  );
}

test("/space is free of WCAG 2.1 AA violations", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "A11y space");
  await expectNoViolations(page);
});

test("an object detail page is free of WCAG 2.1 AA violations", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "A11y detail");
  const noteId = await createObject(page, {
    kind: "note",
    title: "Accessible note",
    text: "Scanned for WCAG 2.1 AA violations.",
  });
  await createObject(page, {
    kind: "question",
    title: "Which note is linked?",
    text: "Points at the note above.",
    options: "Accessible note\nSomething else",
    answers: "Accessible note",
    links: [noteId],
  });
  await page.goto(`/question/${noteId}`);
  await expect(
    page.getByRole("heading", { name: "Accessible note" }),
  ).toBeVisible();
  await expectNoViolations(page);
});

test("the open command palette is free of WCAG 2.1 AA violations", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "A11y palette");
  await visit(page, "/space");
  await page.keyboard.press("ControlOrMeta+k");
  await expect(
    page.getByPlaceholder("Search objects, or jump to a section"),
  ).toBeVisible();
  // "aria-required-children" is deferred here, not fixed: cmdk 1.1.1 (the
  // library src/components/ui/command.tsx wraps, unmodified from shadcn's
  // generator) hardcodes role="listbox" on its List and role="separator" on
  // its Separator, and ARIA 1.1 disallows a listbox containing anything but
  // option/group children. Confirmed in cmdk's own compiled output
  // (node_modules/cmdk/dist/index.js), not in any of this app's code — see
  // plan.md §8's accessibility-pass entry for the full note.
  await expectNoViolations(page, ["aria-required-children"]);
});

test("the practice study session runner is free of WCAG 2.1 AA violations", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "A11y practice");
  await createObject(page, {
    kind: "question",
    title: "What is 2 + 2?",
    text: "Basic arithmetic.",
    options: "3\n4\n5",
    answers: "4",
  });
  await startSession(page, "due", "practice");
  await expect(page.getByText("What is 2 + 2?")).toBeVisible();
  await expectNoViolations(page);

  // The self-grade feedback surface is a distinct state of the same runner.
  await page.getByRole("radio", { name: "4", exact: true }).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("That's right.")).toBeVisible();
  await expectNoViolations(page);
});

test("the simulated exam runner is free of WCAG 2.1 AA violations", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "A11y exam");
  await createObject(page, {
    kind: "question",
    title: "Capital of France?",
    text: "Geography.",
    options: "Paris\nLyon",
    answers: "Paris",
  });
  await startSession(page, "due", "simulated_exam");
  await expect(page.getByText(/seconds left/)).toBeVisible();
  await expectNoViolations(page);
});

test("/settings is free of WCAG 2.1 AA violations", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "A11y settings");
  await visit(page, "/settings");
  await expectNoViolations(page);
});
