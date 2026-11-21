import type { CreateAttemptInput } from "@/types/attempt";
import { QUESTION_TYPES } from "@/types/question";
import { parseSubmittedAnswer } from "./submitted-answer";

export type AttemptValidationErrorCode =
  | "invalidInput"
  | "validationFailed"
  | "questionIdRequired"
  | "cardIdRequired"
  | "invalidRating"
  | "invalidReviewMode"
  | "invalidElapsed"
  | "invalidConfidence"
  | "invalidQuestionType"
  | "invalidSubmittedAnswer"
  | "invalidIsCorrect";

export type AttemptValidationField =
  | "questionId"
  | "cardId"
  | "rating"
  | "reviewMode"
  | "elapsedMilliseconds"
  | "userConfidence"
  | "questionType"
  | "submittedAnswer"
  | "isCorrect";

export interface AttemptValidationResult {
  success: boolean;
  data?: CreateAttemptInput;
  error?: AttemptValidationErrorCode;
  fieldErrors?: Partial<
    Record<AttemptValidationField, AttemptValidationErrorCode>
  >;
}

const RATINGS = [1, 2, 3, 4] as const;
const MODES = ["review", "mockExam"] as const;
const CONFIDENCES = ["guessed", "uncertain", "confident"] as const;

type AnswerFields = Pick<
  CreateAttemptInput,
  "questionType" | "submittedAnswer" | "isCorrect"
>;

function trimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/** Validates the type, submitted answer, and correctness flag recorded with an attempt. */
function readAnswerFields(
  raw: Record<string, unknown>,
  fieldErrors: NonNullable<AttemptValidationResult["fieldErrors"]>
): AnswerFields | null {
  const questionType = QUESTION_TYPES.find((type) => type === raw.questionType);
  if (!questionType) {
    fieldErrors.questionType = "invalidQuestionType";
  }

  const submittedAnswer = parseSubmittedAnswer(raw.submittedAnswer);
  if (!submittedAnswer || submittedAnswer.type !== questionType) {
    fieldErrors.submittedAnswer = "invalidSubmittedAnswer";
  }

  const isCorrect = raw.isCorrect;
  if (typeof isCorrect !== "boolean") {
    fieldErrors.isCorrect = "invalidIsCorrect";
  }

  if (!questionType || !submittedAnswer || typeof isCorrect !== "boolean") {
    return null;
  }
  return { questionType, submittedAnswer, isCorrect };
}

export function validateCreateAttemptInput(
  input: unknown
): AttemptValidationResult {
  if (!input || typeof input !== "object") {
    return { success: false, error: "invalidInput" };
  }

  const raw = input as Record<string, unknown>;
  const questionId = trimmedString(raw.questionId);
  const cardId = trimmedString(raw.cardId);
  const fieldErrors: NonNullable<AttemptValidationResult["fieldErrors"]> = {};

  if (!questionId) {
    fieldErrors.questionId = "questionIdRequired";
  }
  if (!cardId) {
    fieldErrors.cardId = "cardIdRequired";
  }
  if (!RATINGS.includes(raw.rating as (typeof RATINGS)[number])) {
    fieldErrors.rating = "invalidRating";
  }
  if (!MODES.includes(raw.reviewMode as (typeof MODES)[number])) {
    fieldErrors.reviewMode = "invalidReviewMode";
  }
  const elapsed = raw.elapsedMilliseconds;
  if (!isNonNegativeInteger(elapsed)) {
    fieldErrors.elapsedMilliseconds = "invalidElapsed";
  }
  if (
    raw.userConfidence !== undefined &&
    !CONFIDENCES.includes(raw.userConfidence as (typeof CONFIDENCES)[number])
  ) {
    fieldErrors.userConfidence = "invalidConfidence";
  }

  const answerFields = readAnswerFields(raw, fieldErrors);

  if (Object.keys(fieldErrors).length > 0 || !answerFields) {
    return { success: false, error: "validationFailed", fieldErrors };
  }

  return {
    success: true,
    data: {
      questionId,
      cardId,
      rating: raw.rating as CreateAttemptInput["rating"],
      reviewMode: raw.reviewMode as CreateAttemptInput["reviewMode"],
      elapsedMilliseconds: elapsed as number,
      ...answerFields,
      ...(raw.userConfidence !== undefined
        ? {
            userConfidence:
              raw.userConfidence as CreateAttemptInput["userConfidence"],
          }
        : {}),
    },
  };
}
