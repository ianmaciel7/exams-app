import { normalizeText } from "@/lib/exam/evaluate-answer";
import type {
  CaseStudyPart,
  CaseStudyPartAnswer,
  QuestionProperties,
  SubmittedAnswer,
} from "@/types/question";

/**
 * The blank answer a learner starts from, or null for the instant types
 * (`single-choice`, `true-false`) where nothing is chosen until the click that
 * also submits.
 */
export function createEmptyAnswer(
  question: QuestionProperties
): SubmittedAnswer | null {
  switch (question.type) {
    case "single-choice":
    case "true-false":
      return null;
    case "fill-blank":
      return { type: question.type, value: "" };
    case "multiple-choice":
    case "hotspot":
    case "ordering":
    case "simulation":
      return { type: question.type, value: [] };
    case "dropdown":
    case "matrix":
    case "matching":
    case "drag-and-drop":
    case "case-study":
      return { type: question.type, value: {} };
  }
}

function isPartAnswered(
  part: CaseStudyPart,
  value: CaseStudyPartAnswer | undefined
): boolean {
  if (value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length > 0 && Object.values(value).every(Boolean);
  }
  return part.type === "fill-blank"
    ? normalizeText(value) !== ""
    : value !== "";
}

function isTextAnswerComplete(
  answer: Extract<SubmittedAnswer, { type: "fill-blank" }>
): boolean {
  return normalizeText(answer.value) !== "";
}

function isCollectionAnswerComplete(
  answer: Extract<
    SubmittedAnswer,
    { type: "multiple-choice" | "hotspot" | "simulation" }
  >
): boolean {
  return answer.value.length > 0;
}

function isOrderingAnswerComplete(
  question: Extract<QuestionProperties, { type: "ordering" }>,
  answer: Extract<SubmittedAnswer, { type: "ordering" }>
): boolean {
  return answer.value.length === question.items.length;
}

function isMappedAnswerComplete(
  values: Record<string, unknown>,
  ids: readonly string[]
): boolean {
  return ids.every((id) => Object.hasOwn(values, id) && Boolean(values[id]));
}

function isCaseStudyAnswerComplete(
  question: Extract<QuestionProperties, { type: "case-study" }>,
  answer: Extract<SubmittedAnswer, { type: "case-study" }>
): boolean {
  return (
    question.parts.length > 0 &&
    question.parts.every(
      (part) =>
        Object.hasOwn(answer.value, part.id) &&
        isPartAnswered(part, answer.value[part.id])
    )
  );
}

/**
 * True once every part of the answer is filled in, which is when it may be
 * submitted. Completeness is separate from correctness and never reveals the key.
 */
export function isAnswerComplete(
  question: QuestionProperties,
  answer: SubmittedAnswer | null
): boolean {
  if (answer === null || answer.type !== question.type) {
    return false;
  }

  switch (question.type) {
    case "single-choice":
    case "true-false":
      return true;
    case "fill-blank":
      return isTextAnswerComplete(
        answer as Extract<SubmittedAnswer, { type: "fill-blank" }>
      );
    case "multiple-choice":
    case "hotspot":
      return isCollectionAnswerComplete(
        answer as Extract<
          SubmittedAnswer,
          { type: "multiple-choice" | "hotspot" }
        >
      );
    case "ordering":
      return isOrderingAnswerComplete(
        question,
        answer as Extract<SubmittedAnswer, { type: "ordering" }>
      );
    case "simulation":
      return isCollectionAnswerComplete(
        answer as Extract<SubmittedAnswer, { type: "simulation" }>
      );
    case "dropdown":
      return isMappedAnswerComplete(
        answer.value as Record<string, unknown>,
        question.dropdowns.map((dropdown) => dropdown.id)
      );
    case "matrix":
      return isMappedAnswerComplete(
        answer.value as Record<string, unknown>,
        question.rows.map((row) => row.id)
      );
    case "matching":
      return isMappedAnswerComplete(
        answer.value as Record<string, unknown>,
        question.leftItems.map((item) => item.id)
      );
    case "drag-and-drop":
      return isMappedAnswerComplete(
        answer.value as Record<string, unknown>,
        question.slots.map((slot) => slot.id)
      );
    case "case-study":
      return isCaseStudyAnswerComplete(
        question,
        answer as Extract<SubmittedAnswer, { type: "case-study" }>
      );
  }
}
