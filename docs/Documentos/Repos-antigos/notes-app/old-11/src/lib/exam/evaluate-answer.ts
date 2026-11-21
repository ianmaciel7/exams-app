import type { AttemptRating } from "@/types/attempt";
import type {
  CaseStudyPart,
  CaseStudyPartAnswer,
  QuestionProperties,
  SubmittedAnswer,
} from "@/types/question";

export interface AnswerEvaluation {
  correct: boolean;
  rating: AttemptRating;
}

/**
 * Canonical form used to compare typed text: Unicode NFC, trimmed, inner
 * whitespace collapsed, case-folded. Accents stay significant.
 */
export function normalizeText(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  const left = new Set(a);
  const right = new Set(b);
  return left.size === right.size && [...left].every((id) => right.has(id));
}

function sameMapping(
  submitted: Readonly<Record<string, string>>,
  key: Readonly<Record<string, string>>
): boolean {
  const keyIds = Object.keys(key);
  return (
    Object.keys(submitted).length === keyIds.length &&
    keyIds.every((id) => submitted[id] === key[id])
  );
}

/** True when `value` equals an accepted answer after normalization. */
export function matchesAcceptedAnswer(
  value: string,
  accepted: readonly string[]
): boolean {
  const normalized = normalizeText(value);
  return (
    normalized !== "" &&
    accepted.some((entry) => normalizeText(entry) === normalized)
  );
}

/** Grades one case-study part against its key. */
function evaluatePartAnswer(
  part: CaseStudyPart,
  key: CaseStudyPartAnswer | undefined,
  value: CaseStudyPartAnswer | undefined
): boolean {
  if (key === undefined || value === undefined) {
    return false;
  }

  switch (part.type) {
    case "fill-blank":
      return (
        typeof value === "string" &&
        Array.isArray(key) &&
        matchesAcceptedAnswer(value, key)
      );
    case "dropdown":
      return (
        typeof value === "object" &&
        value !== null &&
        typeof key === "object" &&
        key !== null &&
        !Array.isArray(value) &&
        !Array.isArray(key) &&
        sameMapping(
          value as Record<string, string>,
          key as Record<string, string>
        )
      );
    case "multiple-choice":
      return Array.isArray(value) && Array.isArray(key) && sameSet(value, key);
    case "single-choice":
    case "true-false":
      return typeof value === "string" && value === key;
  }
}

function isCorrect(
  question: QuestionProperties,
  answer: SubmittedAnswer
): boolean {
  switch (question.type) {
    case "single-choice":
    case "true-false":
      return (
        answer.type === question.type && answer.value === question.correctAnswer
      );
    case "multiple-choice":
      return (
        answer.type === question.type &&
        sameSet(answer.value, question.correctAnswer)
      );
    case "fill-blank":
      return (
        answer.type === question.type &&
        matchesAcceptedAnswer(answer.value, question.correctAnswer)
      );
    case "dropdown":
    case "matrix":
    case "matching":
    case "drag-and-drop":
      return (
        answer.type === question.type &&
        sameMapping(answer.value, question.correctAnswer)
      );
    case "ordering":
      return (
        answer.type === question.type &&
        Array.isArray(answer.value) &&
        answer.value.length === question.correctAnswer.length &&
        answer.value.every((id, idx) => id === question.correctAnswer[idx])
      );
    case "hotspot":
      return (
        answer.type === question.type &&
        sameSet(answer.value, question.correctAnswer)
      );
    case "simulation": {
      if (answer.type !== "simulation" || !Array.isArray(answer.value)) {
        return false;
      }
      const executed = answer.value.map(normalizeText);
      const target = question.correctAnswer.map(normalizeText);
      return target.every((expected) => executed.includes(expected));
    }
    case "case-study": {
      const submitted = answer.type === "case-study" ? answer.value : null;
      return (
        submitted !== null &&
        question.parts.every((part) =>
          evaluatePartAnswer(
            part,
            question.correctAnswer[part.id],
            submitted[part.id]
          )
        )
      );
    }
  }
}

/**
 * Grades a submission: only a complete match with the key is Good (3); anything
 * else, including an answer of the wrong type, is Forgot (1) (ADR 0017 section 3).
 */
export function evaluateAnswer(
  question: QuestionProperties,
  answer: SubmittedAnswer
): AnswerEvaluation {
  const correct = isCorrect(question, answer);
  return { correct, rating: correct ? 3 : 1 };
}
