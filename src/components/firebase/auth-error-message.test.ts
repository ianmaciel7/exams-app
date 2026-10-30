import { FirebaseUIError, type FirebaseUI } from "@firebase-oss/ui-core";
import { describe, expect, it, vi } from "vitest";
import { getAuthErrorMessage } from "./auth-error-message";

vi.mock("@firebase-oss/ui-core", () => ({
  FirebaseUIError: class FirebaseUIError extends Error {},
  getTranslation: (_ui: unknown, _group: string, key: string) =>
    key === "unknownError" ? "Try again later." : key,
}));

const ui = {
  locale: {},
} as unknown as FirebaseUI;

describe("getAuthErrorMessage", () => {
  it("keeps the translated message of an expected Firebase UI failure", () => {
    const error = Object.assign(
      Object.create(FirebaseUIError.prototype),
      { message: "Network issue" },
    ) as FirebaseUIError;

    expect(getAuthErrorMessage(error, ui)).toBe(error.message);
  });

  it("does not expose unexpected exception details", () => {
    expect(getAuthErrorMessage(new Error("secret diagnostic"), ui)).toBe(
      "Try again later.",
    );
  });
});
