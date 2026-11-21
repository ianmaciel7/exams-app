import { describe, expect, it } from "vitest";
import {
  caseStudyFixture,
  dragAndDropFixture,
  dropdownFixture,
  fillBlankFixture,
  hotspotFixture,
  matchingFixture,
  matrixFixture,
  multipleChoiceFixture,
  orderingFixture,
  simulationFixture,
  singleChoiceFixture,
  trueFalseFixture,
} from "@/lib/exam/question-fixtures";
import { evaluateAnswer, normalizeText } from "./evaluate-answer";

describe("normalizeText", () => {
  it("trims, collapses whitespace, and ignores case", () => {
    expect(normalizeText("  Cloud   RUN \n")).toBe("cloud run");
  });

  it("composes accents but keeps them significant", () => {
    expect(normalizeText("é")).toBe(normalizeText("é"));
    expect(normalizeText("cafe")).not.toBe(normalizeText("café"));
  });
});

describe("evaluateAnswer: choice", () => {
  it("grades single-choice by the key", () => {
    expect(
      evaluateAnswer(singleChoiceFixture, {
        type: "single-choice",
        value: "b",
      })
    ).toEqual({ correct: true, rating: 3 });
    expect(
      evaluateAnswer(singleChoiceFixture, {
        type: "single-choice",
        value: "a",
      })
    ).toEqual({ correct: false, rating: 1 });
  });

  it("grades true-false by the key", () => {
    expect(
      evaluateAnswer(trueFalseFixture, { type: "true-false", value: "true" })
        .correct
    ).toBe(true);
    expect(
      evaluateAnswer(trueFalseFixture, { type: "true-false", value: "false" })
        .correct
    ).toBe(false);
  });

  it("requires the complete set in multiple-choice", () => {
    const grade = (value: string[]) =>
      evaluateAnswer(multipleChoiceFixture, { type: "multiple-choice", value })
        .correct;
    expect(grade(["a", "c"])).toBe(true);
    expect(grade(["c", "a"])).toBe(true);
    expect(grade(["a"])).toBe(false);
    expect(grade(["a", "b", "c"])).toBe(false);
    expect(grade(["a", "b"])).toBe(false);
    expect(grade([])).toBe(false);
  });

  it("rejects an answer of another type", () => {
    expect(
      evaluateAnswer(singleChoiceFixture, { type: "true-false", value: "true" })
        .correct
    ).toBe(false);
  });
});

describe("evaluateAnswer: fill-blank", () => {
  const grade = (value: string) =>
    evaluateAnswer(fillBlankFixture, { type: "fill-blank", value }).correct;

  it("ignores case and extra whitespace", () => {
    expect(grade("run")).toBe(true);
    expect(grade("  RUN  ")).toBe(true);
    expect(grade("cloud    run")).toBe(true);
  });

  it("accepts any of the accepted answers and rejects others", () => {
    expect(grade("Cloud Run")).toBe(true);
    expect(grade("Functions")).toBe(false);
    expect(grade("")).toBe(false);
    expect(grade("   ")).toBe(false);
  });
});

describe("evaluateAnswer: matching and drag-and-drop", () => {
  it("requires every pair", () => {
    const grade = (value: Record<string, string>) =>
      evaluateAnswer(matchingFixture, { type: "matching", value }).correct;
    expect(grade({ l1: "r1", l2: "r2" })).toBe(true);
    expect(grade({ l1: "r1" })).toBe(false);
    expect(grade({ l1: "r1", l2: "r3" })).toBe(false);
    expect(grade({ l1: "r1", l2: "r2", l3: "r3" })).toBe(false);
  });

  it("requires every slot", () => {
    const grade = (value: Record<string, string>) =>
      evaluateAnswer(dragAndDropFixture, { type: "drag-and-drop", value })
        .correct;
    expect(grade({ s1: "i1", s2: "i2" })).toBe(true);
    expect(grade({ s1: "i2", s2: "i1" })).toBe(false);
    expect(grade({ s1: "i1" })).toBe(false);
    expect(grade({})).toBe(false);
  });
});

describe("evaluateAnswer: structured mappings and commands", () => {
  it("grades dropdown and matrix mappings", () => {
    expect(
      evaluateAnswer(dropdownFixture, {
        type: "dropdown",
        value: { dd1: "cs", dd2: "csql" },
      }).correct
    ).toBe(true);
    expect(
      evaluateAnswer(matrixFixture, {
        type: "matrix",
        value: { r1: "col_true", r2: "col_false" },
      }).correct
    ).toBe(true);
  });

  it("requires ordering to match exactly", () => {
    expect(
      evaluateAnswer(orderingFixture, {
        type: "ordering",
        value: ["step1", "step2", "step3"],
      }).correct
    ).toBe(true);
    expect(
      evaluateAnswer(orderingFixture, {
        type: "ordering",
        value: ["step2", "step1", "step3"],
      }).correct
    ).toBe(false);
  });

  it("accepts the required simulation command", () => {
    expect(
      evaluateAnswer(simulationFixture, {
        type: "simulation",
        value: ["GCLOUD RUN DEPLOY MY-APP --IMAGE GCR.IO/DEMO/APP"],
      }).correct
    ).toBe(true);
    expect(
      evaluateAnswer(simulationFixture, {
        type: "simulation",
        value: ["gcloud run deploy other-app --image gcr.io/demo/app"],
      }).correct
    ).toBe(false);
  });
});

describe("evaluateAnswer: hotspot", () => {
  it("compares the selected areas with the key", () => {
    const grade = (value: string[]) =>
      evaluateAnswer(hotspotFixture, { type: "hotspot", value }).correct;
    expect(grade(["lb"])).toBe(true);
    expect(grade(["db"])).toBe(false);
    expect(grade(["lb", "db"])).toBe(false);
  });

  it("supports several correct areas", () => {
    const question = { ...hotspotFixture, correctAnswer: ["lb", "db"] };
    expect(
      evaluateAnswer(question, { type: "hotspot", value: ["db", "lb"] }).correct
    ).toBe(true);
    expect(
      evaluateAnswer(question, { type: "hotspot", value: ["lb"] }).correct
    ).toBe(false);
  });
});

describe("evaluateAnswer: case-study", () => {
  const grade = (value: Record<string, string | string[]>) =>
    evaluateAnswer(caseStudyFixture, { type: "case-study", value }).correct;

  it("requires every part to be correct", () => {
    expect(grade({ p1: "a", p2: "Pay per use" })).toBe(true);
    expect(grade({ p1: "b", p2: "pay per use" })).toBe(false);
    expect(grade({ p1: "a", p2: "free" })).toBe(false);
    expect(grade({ p1: "a" })).toBe(false);
  });

  it("grades multiple-choice and true-false parts", () => {
    const question = {
      ...caseStudyFixture,
      parts: [
        {
          id: "m",
          type: "multiple-choice" as const,
          prompt: "Pick",
          options: [
            { id: "a", text: "A" },
            { id: "b", text: "B" },
          ],
        },
        {
          id: "t",
          type: "true-false" as const,
          prompt: "True?",
          options: [
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ],
        },
      ],
      correctAnswer: { m: ["a", "b"], t: "false" },
    };
    const value = { m: ["b", "a"], t: "false" };
    expect(
      evaluateAnswer(question, { type: "case-study", value }).correct
    ).toBe(true);
    expect(
      evaluateAnswer(question, {
        type: "case-study",
        value: { ...value, m: ["a"] },
      }).correct
    ).toBe(false);
  });
});
