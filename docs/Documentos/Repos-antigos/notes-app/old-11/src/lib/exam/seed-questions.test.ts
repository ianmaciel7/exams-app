import { describe, expect, it } from "vitest";
import { validateQuestionProperties } from "@/lib/validators/question";
import { QUESTION_TYPES } from "@/types/question";
import { buildExamSeed } from "../../../scripts/tooling/seed-emulator-lib.mjs";

type SeedDocument = {
  path: string;
  data: { objectTypeId?: string; properties?: unknown };
};

describe("emulator seed questions", () => {
  const questions = (
    buildExamSeed({ uid: "u1", now: new Date() }) as SeedDocument[]
  ).filter((doc) => doc.data.objectTypeId === "question");

  it("covers every question type", () => {
    const types = questions.map(
      (doc) => (doc.data.properties as { type: string }).type
    );
    expect(new Set(types)).toEqual(new Set(QUESTION_TYPES));
  });

  it.each(
    questions.map((doc) => [doc.path, doc.data.properties] as const)
  )("%s passes runtime validation", (_path, properties) => {
    const result = validateQuestionProperties(properties);
    expect(result.fieldErrors).toBeUndefined();
    expect(result.success).toBe(true);
  });
});
