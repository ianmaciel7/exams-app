import type { ExamProperties } from "@/types/object";

export type ExamValidationErrorCode =
  | "invalidInput"
  | "validationFailed"
  | "providerRequired"
  | "codeRequired"
  | "invalidQuestionsCount"
  | "invalidPassingScore"
  | "invalidTimeLimit";

export type ExamValidationField =
  | "provider"
  | "code"
  | "totalQuestionsCount"
  | "passingScorePercentage"
  | "timeLimitMinutes";

export interface ExamValidationResult {
  success: boolean;
  data?: ExamProperties;
  error?: ExamValidationErrorCode;
  fieldErrors?: Partial<Record<ExamValidationField, ExamValidationErrorCode>>;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function validateExamProperties(input: unknown): ExamValidationResult {
  if (!input || typeof input !== "object") {
    return { success: false, error: "invalidInput" };
  }

  const raw = input as Record<string, unknown>;
  const provider = typeof raw.provider === "string" ? raw.provider.trim() : "";
  const code = typeof raw.code === "string" ? raw.code.trim() : "";
  const questionIds = Array.isArray(raw.questionIds)
    ? raw.questionIds.filter((id): id is string => typeof id === "string")
    : [];
  const fieldErrors: NonNullable<ExamValidationResult["fieldErrors"]> = {};

  if (!provider) {
    fieldErrors.provider = "providerRequired";
  }
  if (!code) {
    fieldErrors.code = "codeRequired";
  }
  if (!isPositiveInteger(raw.totalQuestionsCount)) {
    fieldErrors.totalQuestionsCount = "invalidQuestionsCount";
  }
  const passing = raw.passingScorePercentage;
  if (typeof passing !== "number" || !(passing >= 0 && passing <= 100)) {
    fieldErrors.passingScorePercentage = "invalidPassingScore";
  }
  if (
    raw.timeLimitMinutes !== undefined &&
    !isPositiveInteger(raw.timeLimitMinutes)
  ) {
    fieldErrors.timeLimitMinutes = "invalidTimeLimit";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "validationFailed", fieldErrors };
  }

  return {
    success: true,
    data: {
      provider,
      code,
      totalQuestionsCount: raw.totalQuestionsCount as number,
      passingScorePercentage: passing as number,
      ...(raw.timeLimitMinutes !== undefined
        ? { timeLimitMinutes: raw.timeLimitMinutes as number }
        : {}),
      questionIds,
    },
  };
}
