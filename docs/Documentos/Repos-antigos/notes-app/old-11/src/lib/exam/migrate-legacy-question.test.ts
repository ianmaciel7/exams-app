import { describe, expect, it } from "vitest";
import { validateQuestionProperties } from "@/lib/validators/question";
import {
  isLegacyQuestion,
  migrateLegacyQuestion,
} from "./migrate-legacy-question";

const legacy = {
  statement: "  Which service runs containers?  ",
  options: [
    { id: "a", text: "Compute Engine" },
    { id: "b", text: "Cloud Run" },
  ],
  correctOptionIds: ["b"],
  examId: "exam-1",
  orderIndex: 2,
  format: "single_choice",
};

function migrated(input: unknown) {
  const result = migrateLegacyQuestion(input);
  if (!result.ok) {
    throw new Error(`expected a migration, got ${result.reason}`);
  }
  return result;
}

describe("isLegacyQuestion", () => {
  it("recognizes the legacy shape only", () => {
    expect(isLegacyQuestion(legacy)).toBe(true);
    expect(isLegacyQuestion({ ...legacy, type: "single-choice" })).toBe(false);
    expect(isLegacyQuestion(null)).toBe(false);
    expect(isLegacyQuestion({ prompt: "x" })).toBe(false);
  });
});

describe("migrateLegacyQuestion", () => {
  it("converts one correct option to single-choice", () => {
    const { properties, notes } = migrated(legacy);
    expect(properties).toEqual({
      type: "single-choice",
      prompt: "Which service runs containers?",
      options: legacy.options,
      correctAnswer: "b",
      examId: "exam-1",
      orderIndex: 2,
    });
    expect(notes).toEqual([]);
    expect(validateQuestionProperties(properties).success).toBe(true);
  });

  it("converts multiple_choice to multiple-choice", () => {
    const { properties } = migrated({
      ...legacy,
      format: "multiple_choice",
      correctOptionIds: ["a", "b"],
    });
    expect(properties).toMatchObject({
      type: "multiple-choice",
      correctAnswer: ["a", "b"],
    });
    expect(validateQuestionProperties(properties).success).toBe(true);
  });

  it("keeps multiple_choice with a single correct option as multiple-choice", () => {
    const { properties } = migrated({ ...legacy, format: "multiple_choice" });
    expect(properties).toMatchObject({
      type: "multiple-choice",
      correctAnswer: ["b"],
    });
  });

  it("flags a single_choice question that lists several correct options", () => {
    const { properties, notes } = migrated({
      ...legacy,
      correctOptionIds: ["a", "b"],
    });
    expect(properties.type).toBe("multiple-choice");
    expect(notes).toEqual(["singleChoiceHadMultipleAnswers"]);
  });

  it("carries the grounded explanation over as the explanation", () => {
    const { properties } = migrated({
      ...legacy,
      groundedExplanation: {
        text: "Serverless.",
        referenceUrls: ["https://example.com/run", 3],
        answerProvenance: "official",
      },
    });
    expect(properties.explanation).toEqual({
      text: "Serverless.",
      referenceUrls: ["https://example.com/run"],
      answerProvenance: "official",
    });
    expect(validateQuestionProperties(properties).success).toBe(true);
  });

  it("defaults an unknown provenance to user and ignores a blank explanation", () => {
    expect(
      migrated({
        ...legacy,
        groundedExplanation: { text: "x", answerProvenance: "?" },
      }).properties.explanation?.answerProvenance
    ).toBe("user");
    expect(
      migrated({ ...legacy, groundedExplanation: { text: " " } }).properties
    ).not.toHaveProperty("explanation");
  });

  it("converts a question without options but with text answers to fill-blank", () => {
    const { properties } = migrated({
      statement: "Cloud ____",
      examId: "exam-1",
      orderIndex: 0,
      correctAnswers: ["Run", " "],
    });
    expect(properties).toMatchObject({
      type: "fill-blank",
      correctAnswer: ["Run"],
    });
    expect(validateQuestionProperties(properties).success).toBe(true);
  });

  it("converts a question without options or answers to a reveal-only case study", () => {
    const statement = "Describe the migration plan.";
    const { properties, notes } = migrated({
      statement,
      examId: "exam-1",
      orderIndex: 0,
    });
    expect(properties).toMatchObject({
      type: "case-study",
      title: statement,
      context: statement,
      parts: [],
      correctAnswer: {},
    });
    expect(notes).toEqual(["revealOnlyCaseStudy"]);
    expect(validateQuestionProperties(properties).success).toBe(true);
  });

  it("truncates a long statement for the case study title", () => {
    const { properties } = migrated({
      statement: "x".repeat(200),
      examId: "exam-1",
      orderIndex: 0,
    });
    expect(properties.type === "case-study" && properties.title).toHaveLength(
      80
    );
  });

  it("reports why a legacy document cannot be migrated", () => {
    const reason = (input: unknown) => {
      const result = migrateLegacyQuestion(input);
      return result.ok ? "ok" : result.reason;
    };
    expect(reason({ ...legacy, type: "single-choice" })).toBe("notLegacy");
    expect(reason({ ...legacy, statement: " " })).toBe("invalidLegacy");
    expect(reason({ ...legacy, examId: "" })).toBe("invalidLegacy");
    expect(reason({ ...legacy, orderIndex: -1 })).toBe("invalidLegacy");
    expect(reason({ ...legacy, correctOptionIds: [] })).toBe("noCorrectOption");
    expect(reason({ ...legacy, correctOptionIds: ["zzz"] })).toBe(
      "unknownCorrectOption"
    );
    expect(reason({ ...legacy, options: [{ id: "a", text: "Only" }] })).toBe(
      "tooFewOptions"
    );
  });

  it("is idempotent: a migrated document is no longer legacy", () => {
    const { properties } = migrated(legacy);
    expect(migrateLegacyQuestion(properties)).toEqual({
      ok: false,
      reason: "notLegacy",
    });
  });
});
