// Converts the ADR 0017 ("exam_topic") shape into the ADR 0018 model. This file
// imports types only so Node can run it directly from the migration script.
import type {
  GroundedExplanation,
  QuestionBase,
  QuestionBody,
  QuestionOption,
  QuestionProperties,
} from "@/types/question";

export type LegacyMigrationNote =
  /** A `single_choice` question listed several correct options. */
  | "singleChoiceHadMultipleAnswers"
  /** No options and no textual answers: kept as a reveal-only case study. */
  | "revealOnlyCaseStudy";

export type LegacyMigrationFailure =
  | "notLegacy"
  | "invalidLegacy"
  | "noCorrectOption"
  | "unknownCorrectOption"
  | "tooFewOptions";

export type LegacyMigrationResult =
  | {
      ok: true;
      properties: QuestionProperties;
      notes: LegacyMigrationNote[];
    }
  | { ok: false; reason: LegacyMigrationFailure };

const TITLE_MAX_LENGTH = 80;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readOptions(value: unknown): QuestionOption[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const options: QuestionOption[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }
    const id = readText(entry.id);
    const text = readText(entry.text);
    if (id && text) {
      options.push({ id, text });
    }
  }
  return options;
}

/** True for a question that still uses the legacy shape (no `type`, has `statement`). */
export function isLegacyQuestion(properties: unknown): boolean {
  return (
    isRecord(properties) &&
    properties.type === undefined &&
    typeof properties.statement === "string"
  );
}

function readExplanation(value: unknown): GroundedExplanation | undefined {
  if (!isRecord(value) || !readText(value.text)) {
    return undefined;
  }
  return {
    text: readText(value.text),
    referenceUrls: readStrings(value.referenceUrls),
    answerProvenance: isProvenance(value.answerProvenance)
      ? value.answerProvenance
      : "user",
  };
}

function isProvenance(
  value: unknown
): value is GroundedExplanation["answerProvenance"] {
  return (
    value === "official" ||
    value === "suggested" ||
    value === "community" ||
    value === "user" ||
    value === "ai"
  );
}

function convertChoice(
  raw: Record<string, unknown>,
  options: QuestionOption[],
  notes: LegacyMigrationNote[]
): QuestionBody | LegacyMigrationFailure {
  const correct = readStrings(raw.correctOptionIds);
  if (correct.length === 0) {
    return "noCorrectOption";
  }
  if (correct.some((id) => !options.some((option) => option.id === id))) {
    return "unknownCorrectOption";
  }

  const wantsSeveral = raw.format === "multiple_choice";
  if (correct.length === 1 && !wantsSeveral) {
    return { type: "single-choice", options, correctAnswer: correct[0] };
  }
  if (correct.length > 1 && !wantsSeveral) {
    notes.push("singleChoiceHadMultipleAnswers");
  }
  return { type: "multiple-choice", options, correctAnswer: correct };
}

function convertWithoutOptions(
  raw: Record<string, unknown>,
  statement: string,
  notes: LegacyMigrationNote[]
): QuestionBody {
  const accepted = readStrings(raw.correctAnswers);
  if (accepted.length > 0) {
    return { type: "fill-blank", correctAnswer: accepted };
  }
  notes.push("revealOnlyCaseStudy");
  return {
    type: "case-study",
    title: statement.slice(0, TITLE_MAX_LENGTH),
    context: statement,
    sections: [{ id: "statement", title: "Statement", content: statement }],
    parts: [],
    correctAnswer: {},
  };
}

function readBody(
  raw: Record<string, unknown>,
  statement: string,
  notes: LegacyMigrationNote[]
): QuestionBody | LegacyMigrationFailure {
  const options = readOptions(raw.options);
  if (options.length >= 2) {
    return convertChoice(raw, options, notes);
  }
  if (options.length === 1) {
    return "tooFewOptions";
  }
  return convertWithoutOptions(raw, statement, notes);
}

/**
 * Converts one legacy `properties` object. Pure and idempotent in effect: a
 * document that already has a `type` is reported as `notLegacy` and left alone.
 */
export function migrateLegacyQuestion(input: unknown): LegacyMigrationResult {
  if (!isLegacyQuestion(input) || !isRecord(input)) {
    return { ok: false, reason: "notLegacy" };
  }

  const statement = readText(input.statement);
  const examId = readText(input.examId);
  const orderIndex = input.orderIndex;
  if (
    !statement ||
    !examId ||
    typeof orderIndex !== "number" ||
    !Number.isInteger(orderIndex) ||
    orderIndex < 0
  ) {
    return { ok: false, reason: "invalidLegacy" };
  }

  const notes: LegacyMigrationNote[] = [];
  const body = readBody(input, statement, notes);
  if (typeof body === "string") {
    return { ok: false, reason: body };
  }

  const explanation = readExplanation(input.groundedExplanation);
  const base: QuestionBase = {
    prompt: statement,
    examId,
    orderIndex,
    ...(explanation ? { explanation } : {}),
  };
  return { ok: true, properties: { ...base, ...body }, notes };
}
