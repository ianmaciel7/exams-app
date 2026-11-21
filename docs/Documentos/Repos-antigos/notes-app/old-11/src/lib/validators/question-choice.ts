import type {
  QuestionBody,
  QuestionOption,
  TrueFalseValue,
} from "@/types/question";
import {
  hasDuplicates,
  isRecord,
  isStringList,
  parseOptionalImage,
  type QuestionFieldErrors,
  type QuestionValidationErrorCode,
  readText,
} from "./question-fields";

export type ChoiceType = "single-choice" | "multiple-choice" | "true-false";

const TRUE_FALSE_IDS = ["true", "false"] as const;

function parseOptions(value: unknown): QuestionOption[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const options: QuestionOption[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      return null;
    }
    const id = readText(entry.id);
    const text = readText(entry.text);
    const image = parseOptionalImage(entry);
    if (!id || !text || !image) {
      return null;
    }
    if (entry.explanation !== undefined && !readText(entry.explanation)) {
      return null;
    }
    const explanation = readText(entry.explanation);
    options.push({
      id,
      text,
      ...(explanation ? { explanation } : {}),
      ...image,
    });
  }
  return options;
}

/** Validates the option list for a choice type; `error` is set when it is invalid. */
export function checkOptions(
  type: ChoiceType,
  value: unknown
): { options: QuestionOption[]; error?: QuestionValidationErrorCode } {
  const options = parseOptions(value);
  if (!options) {
    return { options: [], error: "invalidOptions" };
  }

  const ids = options.map((option) => option.id);
  if (type === "true-false") {
    const exact =
      ids.length === TRUE_FALSE_IDS.length &&
      TRUE_FALSE_IDS.every((id) => ids.includes(id));
    return { options, ...(exact ? {} : { error: "trueFalseOptionsInvalid" }) };
  }
  if (options.length < 2) {
    return { options, error: "minOptionsRequired" };
  }
  if (hasDuplicates(ids)) {
    return { options, error: "duplicateId" };
  }
  return { options };
}

function isTrueFalse(value: unknown): value is TrueFalseValue {
  return value === "true" || value === "false";
}

/** Checks a choice answer against its options; undefined means valid. */
export function checkChoiceAnswer(
  type: ChoiceType,
  options: readonly QuestionOption[],
  answer: unknown
): QuestionValidationErrorCode | undefined {
  const ids = options.map((option) => option.id);
  if (type === "multiple-choice") {
    const valid =
      isStringList(answer) &&
      answer.length > 0 &&
      !hasDuplicates(answer) &&
      answer.every((id) => ids.includes(id));
    return valid ? undefined : "invalidCorrectAnswer";
  }
  if (type === "true-false") {
    return isTrueFalse(answer) ? undefined : "invalidCorrectAnswer";
  }
  return typeof answer === "string" && ids.includes(answer)
    ? undefined
    : "invalidCorrectAnswer";
}

/** Fill-blank keys are one or more accepted answers; blank strings are rejected. */
export function checkFillBlankAnswer(
  answer: unknown
): QuestionValidationErrorCode | undefined {
  return isStringList(answer) && answer.length > 0
    ? undefined
    : "invalidCorrectAnswer";
}

function formatChoiceBody(
  type: ChoiceType,
  options: QuestionOption[],
  raw: Record<string, unknown>
): QuestionBody | undefined {
  const answer = raw.correctAnswer;
  if (type === "multiple-choice" && isStringList(answer)) {
    return { type, options, correctAnswer: answer };
  }
  if (type === "true-false" && isTrueFalse(answer)) {
    const variant =
      raw.variant === "yes-no" || raw.variant === "true-false"
        ? raw.variant
        : undefined;
    return {
      type,
      options,
      correctAnswer: answer,
      ...(variant ? { variant } : {}),
    };
  }
  if (type === "single-choice" && typeof answer === "string") {
    return { type, options, correctAnswer: answer };
  }
  return undefined;
}

export function validateChoiceBody(
  type: ChoiceType,
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const { options, error } = checkOptions(type, raw.options);
  if (error) {
    errors.options = error;
  }

  const answerError = checkChoiceAnswer(type, options, raw.correctAnswer);
  if (answerError) {
    errors.correctAnswer = answerError;
  }
  if (error || answerError) {
    return undefined;
  }

  return formatChoiceBody(type, options, raw);
}

export function validateFillBlankBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const answer = raw.correctAnswer;
  const answerError = checkFillBlankAnswer(answer);
  if (answerError || !isStringList(answer)) {
    errors.correctAnswer = answerError ?? "invalidCorrectAnswer";
    return undefined;
  }
  return {
    type: "fill-blank",
    correctAnswer: answer.map((entry) => entry.trim()),
  };
}
