import { describe, expect, it } from "vitest";
import { validateCreateSpaceInput } from "./space";

describe("validateCreateSpaceInput", () => {
  it("validates valid input correctly", () => {
    const result = validateCreateSpaceInput({
      name: "My Space",
      icon: "book",
    });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("My Space");
    expect(result.data?.icon).toBe("book");
  });

  it("fails when name is missing", () => {
    const result = validateCreateSpaceInput({
      name: "   ",
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.name).toBe("nameRequired");
  });

  it("returns stable error codes for length violations", () => {
    const result = validateCreateSpaceInput({
      name: "a".repeat(51),
      description: "b".repeat(201),
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("validationFailed");
    expect(result.fieldErrors?.name).toBe("nameTooLong");
    expect(result.fieldErrors?.description).toBe("descriptionTooLong");
  });

  it("rejects non-object payloads", () => {
    const result = validateCreateSpaceInput(null);

    expect(result.success).toBe(false);
    expect(result.error).toBe("invalidInput");
  });

  it("fails when icon is invalid", () => {
    const result = validateCreateSpaceInput({
      name: "Space",
      icon: "invalid-icon",
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.icon).toBe("invalidIcon");
  });
});
