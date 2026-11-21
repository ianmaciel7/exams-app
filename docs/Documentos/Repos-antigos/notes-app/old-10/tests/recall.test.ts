import assert from "node:assert/strict";
import test from "node:test";
import {
  autoQuality,
  EXAM_GRACE_MS,
  examDurationSeconds,
  graceExpired,
  grade,
  objectInput,
  plainText,
  schedule,
} from "../src/domain/recall";

test("grade: single-choice evaluation", () => {
  const question = {
    format: "single-choice" as const,
    answers: ["Option B"],
  };
  assert.equal(grade(question, ["Option B"]), true);
  assert.equal(grade(question, ["option b "]), true); // case and whitespace insensitivity
  assert.equal(grade(question, ["Option A"]), false);
  assert.equal(grade(question, []), false);
});

test("grade: multiple-choice evaluation", () => {
  const question = {
    format: "multiple-choice" as const,
    answers: ["A", "C"],
  };
  assert.equal(grade(question, ["A", "C"]), true);
  assert.equal(grade(question, ["c", "a"]), true); // order independence
  assert.equal(grade(question, ["A"]), false);
  assert.equal(grade(question, ["A", "B"]), false);
  assert.equal(grade(question, ["A", "A", "C"]), false); // duplicates rejected
});

test("grade: fill-blank evaluation", () => {
  const question = {
    format: "fill-blank" as const,
    answers: ["mitochondria", "mitochondrion"],
  };
  assert.equal(grade(question, ["mitochondria"]), true);
  assert.equal(grade(question, [" Mitochondrion "]), true);
  assert.equal(grade(question, ["nucleus"]), false);
});

test("grade: matching evaluation", () => {
  const question = {
    format: "matching" as const,
    answers: ["first", "second"],
  };
  assert.equal(grade(question, ["first", "second"]), true);
  assert.equal(grade(question, ["second", "first"]), false); // order-sensitive
});

const now = 1700000000000;
const close = (actual: number, expected: number) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `expected ${actual} to be ${expected}`,
  );

test("schedule: SM-2 ease factor vectors across the 0-5 scale", () => {
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), floored at 1.3.
  close(schedule(undefined, 5, now).ease, 2.6);
  close(schedule(undefined, 4, now).ease, 2.5);
  close(schedule(undefined, 3, now).ease, 2.36);
  close(schedule(undefined, 2, now).ease, 2.18);
  close(schedule(undefined, 1, now).ease, 1.96);
  close(schedule(undefined, 0, now).ease, 1.7);
});

test("schedule: ease factor never drops below 1.3", () => {
  let record = schedule(undefined, 0, now);
  for (let n = 0; n < 10; n++) record = schedule(record, 0, now);
  assert.equal(record.ease, 1.3);
});

test("schedule: interval progression is 1, 6, then I(n-1) * EF'", () => {
  const first = schedule(undefined, 4, now);
  assert.equal(first.repetitions, 1);
  assert.equal(first.interval, 1);
  assert.equal(first.due, now + 86400000);

  const second = schedule(first, 4, now);
  assert.equal(second.repetitions, 2);
  assert.equal(second.interval, 6);

  const third = schedule(second, 4, now);
  assert.equal(third.repetitions, 3);
  assert.equal(third.interval, Math.round(6 * third.ease)); // uses the updated EF'
  assert.equal(third.due, now + third.interval * 86400000);
});

test("schedule: a grade below 3 resets repetitions and interval", () => {
  const second = schedule(schedule(undefined, 5, now), 5, now);
  const lapsed = schedule(second, 2, now);

  assert.equal(lapsed.repetitions, 0);
  assert.equal(lapsed.interval, 1);
  assert.equal(lapsed.attempts, 3);
  assert.equal(lapsed.correct, 2); // the lapse is not counted as a recall
  assert.ok(lapsed.ease < second.ease);
});

test("schedule: grade 3 counts as a recall, grade 2 does not", () => {
  assert.equal(schedule(undefined, 3, now).repetitions, 1);
  assert.equal(schedule(undefined, 2, now).repetitions, 0);
});

test("schedule: rejects a grade outside the 0-5 scale", () => {
  assert.throws(() => schedule(undefined, 6, now));
  assert.throws(() => schedule(undefined, -1, now));
});

test("autoQuality: maps a machine verdict onto the 0-5 scale", () => {
  assert.equal(schedule(undefined, autoQuality(true), now).repetitions, 1);
  assert.equal(schedule(undefined, autoQuality(false), now).repetitions, 0);
});

const doc = (...paragraphs: string[]) => ({
  type: "doc" as const,
  content: paragraphs.map((text) => ({
    type: "paragraph",
    content: text ? [{ type: "text", text }] : [],
  })),
});

test("objectInput: validates valid question object", () => {
  const validQuestion = {
    title: "What is 2 + 2?",
    kind: "question" as const,
    body: doc("Basic arithmetic question"),
    url: "",
    format: "single-choice" as const,
    options: ["3", "4", "5"],
    answers: ["4"],
    links: [],
  };
  const parsed = objectInput.safeParse(validQuestion);
  assert.equal(parsed.success, true);
});

test("plainText: flattens a document to one line per block", () => {
  assert.equal(plainText(doc("first", "second")), "first\nsecond");
  assert.equal(plainText(doc("only", "")), "only\n");
  assert.equal(plainText({ content: undefined }), "");
});

test("plainText: reads text out of nested marks and lists", () => {
  const nested = {
    content: [
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "bold", marks: [{ type: "bold" }] },
                  { type: "text", text: " and plain" },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  assert.equal(plainText(nested), "bold and plain");
});

test("graceExpired: a null deadline (practice mode) never expires", () => {
  assert.equal(graceExpired(null, now), false);
  assert.equal(graceExpired(null, now + 1e12), false);
});

test("graceExpired: false right up to the deadline, and through the 15s grace window", () => {
  const deadline = now;
  assert.equal(graceExpired(deadline, deadline - 1), false);
  assert.equal(graceExpired(deadline, deadline), false); // at 00:00, no grace needed yet
  assert.equal(graceExpired(deadline, deadline + EXAM_GRACE_MS - 1), false);
});

test("graceExpired: true once the grace window itself has elapsed", () => {
  const deadline = now;
  assert.equal(graceExpired(deadline, deadline + EXAM_GRACE_MS), true);
  assert.equal(graceExpired(deadline, deadline + EXAM_GRACE_MS + 1), true);
});

test("examDurationSeconds: accepts 5 minutes to 4 hours, rejects outside that range", () => {
  assert.equal(examDurationSeconds.safeParse(300).success, true);
  assert.equal(examDurationSeconds.safeParse(14400).success, true);
  assert.equal(examDurationSeconds.safeParse(299).success, false);
  assert.equal(examDurationSeconds.safeParse(14401).success, false);
  assert.equal(examDurationSeconds.safeParse(undefined).success, false);
});

test("objectInput: rejects a document nested past the depth cap", () => {
  let node: Record<string, unknown> = { type: "text", text: "deep" };
  for (let n = 0; n < 20; n++) node = { type: "paragraph", content: [node] };
  const parsed = objectInput.safeParse({
    title: "Deep",
    kind: "note" as const,
    body: { type: "doc", content: [node] },
    url: "",
    format: "single-choice" as const,
    options: [],
    answers: [],
    links: [],
  });
  assert.equal(parsed.success, false);
});
