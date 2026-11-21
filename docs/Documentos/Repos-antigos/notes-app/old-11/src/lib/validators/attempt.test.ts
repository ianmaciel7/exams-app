import { describe, expect, it } from "vitest";
import { validateCreateAttemptInput } from "./attempt";

const valid = {
  questionId: " q1 ",
  cardId: "c1",
  rating: 3,
  reviewMode: "review",
  elapsedMilliseconds: 1200,
  questionType: "single-choice",
  submittedAnswer: { type: "single-choice", value: "b" },
  isCorrect: true,
};

describe("validateCreateAttemptInput", () => {
  it("accepts valid input and trims ids", () => {
    const result = validateCreateAttemptInput(valid);
    expect(result.success).toBe(true);
    expect(result.data?.questionId).toBe("q1");
    expect(result.data?.submittedAnswer).toEqual(valid.submittedAnswer);
    expect(result.data?.isCorrect).toBe(true);
    expect(result.data).not.toHaveProperty("userConfidence");
  });

  it("keeps a valid confidence", () => {
    const result = validateCreateAttemptInput({
      ...valid,
      userConfidence: "guessed",
    });
    expect(result.data?.userConfidence).toBe("guessed");
  });

  it("rejects non-object input", () => {
    expect(validateCreateAttemptInput(null).error).toBe("invalidInput");
  });

  it("reports all invalid fields", () => {
    const result = validateCreateAttemptInput({
      questionId: "",
      cardId: "",
      rating: 5,
      reviewMode: "other",
      elapsedMilliseconds: -1,
      userConfidence: "sure",
      questionType: "essay",
      submittedAnswer: "b",
      isCorrect: "yes",
    });
    expect(result.error).toBe("validationFailed");
    expect(result.fieldErrors).toEqual({
      questionId: "questionIdRequired",
      cardId: "cardIdRequired",
      rating: "invalidRating",
      reviewMode: "invalidReviewMode",
      elapsedMilliseconds: "invalidElapsed",
      userConfidence: "invalidConfidence",
      questionType: "invalidQuestionType",
      submittedAnswer: "invalidSubmittedAnswer",
      isCorrect: "invalidIsCorrect",
    });
  });

  it("rejects an answer whose type differs from the question type", () => {
    const result = validateCreateAttemptInput({
      ...valid,
      submittedAnswer: { type: "hotspot", value: ["lb"] },
    });
    expect(result.fieldErrors).toEqual({
      submittedAnswer: "invalidSubmittedAnswer",
    });
  });

  it.each([
    ["multiple-choice", ["a", "b"]],
    ["true-false", "false"],
    ["fill-blank", "run"],
    ["dropdown", { dd1: "cs", dd2: "csql" }],
    ["matching", { l1: "r1" }],
    ["ordering", ["step1", "step2"]],
    ["drag-and-drop", { s1: "i1" }],
    ["hotspot", ["lb"]],
    ["matrix", { r1: "col_true" }],
    ["simulation", ["gcloud run deploy app"]],
    ["case-study", { p1: "a", p2: ["x"] }],
  ])("accepts a %s answer", (type, value) => {
    const result = validateCreateAttemptInput({
      ...valid,
      questionType: type,
      submittedAnswer: { type, value },
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ["single-choice", ""],
    ["multiple-choice", []],
    ["multiple-choice", ["a", "a"]],
    ["true-false", "maybe"],
    ["fill-blank", "  "],
    ["fill-blank", "a".repeat(1001)],
    ["matching", { l1: "" }],
    ["hotspot", [1]],
    ["hotspot", ["lb", "lb"]],
    ["case-study", { p1: 1 }],
  ])("rejects an empty or malformed %s answer", (type, value) => {
    const result = validateCreateAttemptInput({
      ...valid,
      questionType: type,
      submittedAnswer: { type, value },
    });
    expect(result.fieldErrors?.submittedAnswer).toBe("invalidSubmittedAnswer");
  });
});
