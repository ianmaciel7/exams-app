import type { SubmittedAnswer } from "@/types/question";
import { hasDuplicates, isRecord, isStringList } from "./question-fields";

function isIdMap(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (entry) => typeof entry === "string" && entry.trim() !== ""
    )
  );
}

function isPartAnswerMap(
  value: unknown
): value is Record<string, string | string[]> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (entry) => typeof entry === "string" || isStringList(entry)
    )
  );
}

function isNonEmptyText(value: unknown): value is string {
  return (
    typeof value === "string" && value.trim() !== "" && value.length <= 1000
  );
}

/** Narrows an untrusted value to a well-formed `SubmittedAnswer`, or null. */
export function parseSubmittedAnswer(input: unknown): SubmittedAnswer | null {
  if (!isRecord(input)) {
    return null;
  }
  const { type, value } = input;

  switch (type) {
    case "single-choice":
    case "fill-blank":
      return isNonEmptyText(value) ? { type, value } : null;
    case "true-false":
      return value === "true" || value === "false" ? { type, value } : null;
    case "multiple-choice":
    case "hotspot":
    case "ordering":
    case "simulation":
      return isStringList(value) && value.length > 0 && !hasDuplicates(value)
        ? { type, value }
        : null;
    case "dropdown":
    case "matrix":
    case "matching":
    case "drag-and-drop":
      return isIdMap(value) ? { type, value } : null;
    case "case-study":
      return isPartAnswerMap(value) ? { type, value } : null;
    default:
      return null;
  }
}
