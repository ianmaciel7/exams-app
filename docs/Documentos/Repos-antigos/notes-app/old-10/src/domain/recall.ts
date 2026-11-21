import { z } from "zod";

export const kinds = [
  "question",
  "note",
  "citation",
  "tag",
  "collection",
  "exam",
] as const;
export const formats = [
  "single-choice",
  "multiple-choice",
  "fill-blank",
  "matching",
] as const;
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichNode[];
};
// The editor's own JSON is stored verbatim, so it has to be validated as
// untrusted input rather than trusted because TipTap produced it. Depth is
// capped because a deeply nested document would otherwise recurse without
// bound on every read.
const maxDepth = 12;
const richNode: z.ZodType<RichNode> = z.lazy(() =>
  z.object({
    type: z.string().max(40),
    text: z.string().max(50000).optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z
      .array(
        z.object({
          type: z.string().max(40),
          attrs: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .max(10)
      .optional(),
    content: z.array(richNode).max(500).optional(),
  }),
);
export const richDoc = z
  .object({
    type: z.literal("doc"),
    content: z.array(richNode).max(500).optional(),
  })
  .refine(
    (doc) => depthOf(doc) <= maxDepth,
    "This content is nested too deeply.",
  );

function depthOf(node: RichNode | { content?: RichNode[] }): number {
  const children = node.content ?? [];
  return children.length ? 1 + Math.max(...children.map(depthOf)) : 1;
}

export function plainText(doc: { content?: RichNode[] }): string {
  const walk = (node: RichNode): string =>
    node.text ?? (node.content ?? []).map(walk).join("");
  return (doc.content ?? []).map(walk).join("\n").slice(0, 50000);
}

export const objectInput = z
  .object({
    title: z.string().trim().min(1).max(180),
    kind: z.enum(kinds),
    body: richDoc,
    url: z.union([
      z.literal(""),
      z.url().refine((v) => /^https?:\/\//i.test(v)),
    ]),
    format: z.enum(formats),
    options: z.array(z.string().trim().min(1).max(500)).max(20),
    answers: z.array(z.string().trim().min(1).max(500)).max(20),
    links: z.array(z.string().regex(/^[a-zA-Z0-9_-]+$/)).max(100),
  })
  .superRefine((value, context) => {
    if (value.kind !== "question") return;
    if (!value.answers.length)
      context.addIssue({ code: "custom", message: "Add a correct answer." });
    if (value.format.includes("choice")) {
      if (
        value.options.length < 2 ||
        new Set(value.options).size !== value.options.length
      )
        context.addIssue({
          code: "custom",
          message: "Add at least two distinct choices.",
        });
      if (value.answers.some((answer) => !value.options.includes(answer)))
        context.addIssue({
          code: "custom",
          message: "Correct answers must match choices exactly.",
        });
      if (value.format === "single-choice" && value.answers.length !== 1)
        context.addIssue({
          code: "custom",
          message: "Single choice needs one correct answer.",
        });
    }
    if (
      value.format === "matching" &&
      (value.options.length < 2 ||
        value.options.length !== value.answers.length)
    )
      context.addIssue({
        code: "custom",
        message:
          "Matching needs at least two prompts and one answer per prompt, in order.",
      });
  });
export type ObjectInput = z.infer<typeof objectInput>;
export const qualityScale = [
  { value: 0, label: "Blackout" },
  { value: 1, label: "Incorrect" },
  { value: 2, label: "Hard" },
  { value: 3, label: "Good" },
  { value: 4, label: "Easy" },
  { value: 5, label: "Perfect" },
] as const;
export const quality = z.number().int().min(0).max(5);
export type StudyRecord = {
  version: 1;
  repetitions: number;
  interval: number;
  ease: number;
  due: number;
  attempts: number;
  correct: number;
  lastQuality: number;
};
export type RecallObject = ObjectInput & {
  id: string;
  spaceId: string;
  ownerId: string;
  version: number;
  updatedAt: number;
  archived: boolean;
  reported: boolean;
  // Derived server-side from body via plainText(), for search and snippets.
  text: string;
};
export type Attempt = {
  objectId: string;
  correct: boolean;
  expected: string[];
  answeredAt: number;
  previous: StudyRecord | null;
  quality: number;
};
export type Space = {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
};
export type StudySession = {
  id: string;
  spaceId: string;
  uid: string;
  mode: "practice" | "simulated_exam";
  questions: RecallObject[];
  answers: Record<string, string[]>;
  deadline: number | null;
  results: { objectId: string; correct: boolean; expected: string[] }[] | null;
};

// FR-11 / spec.md §2.4.3 "Simulated Exam Timer Expiration": a simulated_exam
// session requires a user-configured time limit (5 minutes to 4 hours), and
// the server enforces a strict 15-second network grace window beyond it so a
// slow connection doesn't silently forfeit an in-flight answer.
export const examDurationSeconds = z.number().int().min(300).max(14400);
export const EXAM_GRACE_MS = 15000;
export const SESSION_EXPIRED = "SESSION_EXPIRED";

// True once `now` is at or past the deadline plus the grace window. A null
// deadline (practice mode) never expires.
export function graceExpired(deadline: number | null, now: number): boolean {
  return deadline != null && now >= deadline + EXAM_GRACE_MS;
}
export type Snapshot = {
  uid: string;
  email: string;
  spaces: Space[];
  spaceId: string;
  objects: RecallObject[];
  records: Record<string, StudyRecord>;
};

export function grade(
  question: Pick<ObjectInput, "format" | "answers">,
  submitted: string[],
) {
  const normalize = (value: string) => value.trim().toLocaleLowerCase("en-US");
  const expected = question.answers.map(normalize);
  const actual = submitted.map(normalize);
  if (question.format === "fill-blank")
    return actual.length === 1 && expected.includes(actual[0]);
  if (question.format === "multiple-choice") {
    return (
      new Set(actual).size === actual.length &&
      actual.length === expected.length &&
      actual.every((value) => expected.includes(value))
    );
  }
  return (
    expected.length === actual.length &&
    expected.every((value, index) => value === actual[index])
  );
}

// An auto-graded format has no independent self-assessment step, so a machine
// verdict maps onto the 0-5 scale rather than replacing it: "Easy" for a right
// answer, "Incorrect" for a wrong one. A learner who self-grades in practice
// mode overrides this via rateAttempt.
export function autoQuality(correct: boolean) {
  return correct ? 4 : 1;
}

export function schedule(
  previous: StudyRecord | undefined,
  qualityGrade: number,
  now: number,
): StudyRecord {
  const q = quality.parse(qualityGrade);
  const ease = Math.max(
    1.3,
    (previous?.ease ?? 2.5) + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );
  const recalled = q >= 3;
  const repetitions = recalled ? (previous?.repetitions ?? 0) + 1 : 0;
  const interval = !recalled
    ? 1
    : repetitions === 1
      ? 1
      : repetitions === 2
        ? 6
        : Math.round((previous?.interval ?? 6) * ease);
  return {
    version: 1,
    repetitions,
    interval,
    ease,
    due: now + interval * 86400000,
    attempts: (previous?.attempts ?? 0) + 1,
    correct: (previous?.correct ?? 0) + Number(recalled),
    lastQuality: q,
  };
}
