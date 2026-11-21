import { describe, expect, it } from "vitest";
import {
  caseStudyFixture,
  dragAndDropFixture,
  fillBlankFixture,
  hotspotFixture,
  matchingFixture,
  multipleChoiceFixture,
  QUESTION_FIXTURES,
  singleChoiceFixture,
} from "@/lib/exam/question-fixtures";
import { QUESTION_TYPES } from "@/types/question";
import { createEmptyAnswer, isAnswerComplete } from "./answer-draft";

describe("createEmptyAnswer", () => {
  it("has no draft for the instant types", () => {
    expect(createEmptyAnswer(singleChoiceFixture)).toBeNull();
    expect(createEmptyAnswer(QUESTION_FIXTURES["true-false"])).toBeNull();
  });

  it("starts the other types blank and never complete", () => {
    for (const type of QUESTION_TYPES) {
      const question = QUESTION_FIXTURES[type];
      const draft = createEmptyAnswer(question);
      if (draft) {
        expect(draft.type).toBe(type);
        expect(isAnswerComplete(question, draft)).toBe(false);
      }
    }
  });
});

describe("isAnswerComplete", () => {
  it("is false without a draft or with another type", () => {
    expect(isAnswerComplete(singleChoiceFixture, null)).toBe(false);
    expect(
      isAnswerComplete(singleChoiceFixture, { type: "hotspot", value: ["a"] })
    ).toBe(false);
  });

  it("is true for a chosen single-choice option", () => {
    expect(
      isAnswerComplete(singleChoiceFixture, {
        type: "single-choice",
        value: "a",
      })
    ).toBe(true);
  });

  it("needs at least one selection for multiple-choice and hotspot", () => {
    expect(
      isAnswerComplete(multipleChoiceFixture, {
        type: "multiple-choice",
        value: ["a"],
      })
    ).toBe(true);
    expect(
      isAnswerComplete(hotspotFixture, { type: "hotspot", value: [] })
    ).toBe(false);
  });

  it("needs non-blank text for fill-blank", () => {
    expect(
      isAnswerComplete(fillBlankFixture, { type: "fill-blank", value: "  " })
    ).toBe(false);
    expect(
      isAnswerComplete(fillBlankFixture, { type: "fill-blank", value: "x" })
    ).toBe(true);
  });

  it("needs every left item matched and every slot filled", () => {
    expect(
      isAnswerComplete(matchingFixture, {
        type: "matching",
        value: { l1: "r1" },
      })
    ).toBe(false);
    expect(
      isAnswerComplete(matchingFixture, {
        type: "matching",
        value: { l1: "r1", l2: "r1" },
      })
    ).toBe(true);
    expect(
      isAnswerComplete(dragAndDropFixture, {
        type: "drag-and-drop",
        value: { s1: "i1" },
      })
    ).toBe(false);
    expect(
      isAnswerComplete(dragAndDropFixture, {
        type: "drag-and-drop",
        value: { s1: "i1", s2: "i2" },
      })
    ).toBe(true);
  });

  it("needs every case-study part answered, and never completes without parts", () => {
    const answer = (value: Record<string, string | string[]>) =>
      isAnswerComplete(caseStudyFixture, { type: "case-study", value });
    expect(answer({ p1: "a" })).toBe(false);
    expect(answer({ p1: "a", p2: "  " })).toBe(false);
    expect(answer({ p1: "a", p2: "x" })).toBe(true);
    expect(
      isAnswerComplete(
        { ...caseStudyFixture, parts: [], correctAnswer: {} },
        { type: "case-study", value: {} }
      )
    ).toBe(false);
  });
});
