import { describe, expect, it } from "vitest";
import { validateExamProperties } from "./exam";

const valid = {
  provider: " Google ",
  code: "GCP-PCA",
  totalQuestionsCount: 50,
  passingScorePercentage: 70,
  timeLimitMinutes: 120,
  questionIds: ["q1", "q2", 3],
};

describe("validateExamProperties", () => {
  it("accepts valid input and trims strings", () => {
    const result = validateExamProperties(valid);
    expect(result.success).toBe(true);
    expect(result.data?.provider).toBe("Google");
    expect(result.data?.questionIds).toEqual(["q1", "q2"]);
    expect(result.data?.timeLimitMinutes).toBe(120);
  });

  it("omits optional time limit and tolerates missing questionIds", () => {
    const result = validateExamProperties({
      ...valid,
      timeLimitMinutes: undefined,
      questionIds: undefined,
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("timeLimitMinutes");
    expect(result.data?.questionIds).toEqual([]);
  });

  it("rejects non-object input", () => {
    expect(validateExamProperties(null).error).toBe("invalidInput");
    expect(validateExamProperties("x").error).toBe("invalidInput");
  });

  it("reports every invalid field", () => {
    const result = validateExamProperties({
      provider: " ",
      code: 5,
      totalQuestionsCount: 0,
      passingScorePercentage: 101,
      timeLimitMinutes: -1,
    });
    expect(result.error).toBe("validationFailed");
    expect(result.fieldErrors).toEqual({
      provider: "providerRequired",
      code: "codeRequired",
      totalQuestionsCount: "invalidQuestionsCount",
      passingScorePercentage: "invalidPassingScore",
      timeLimitMinutes: "invalidTimeLimit",
    });
  });

  it("rejects non-numeric passing score", () => {
    const result = validateExamProperties({
      ...valid,
      passingScorePercentage: "70",
    });
    expect(result.fieldErrors?.passingScorePercentage).toBe(
      "invalidPassingScore"
    );
  });
});
