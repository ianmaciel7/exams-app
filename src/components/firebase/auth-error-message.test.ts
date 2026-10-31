import { FirebaseUIError, type FirebaseUI } from "@firebase-oss/ui-core";
import { enUs } from "@firebase-oss/ui-translations";
import { FirebaseError } from "firebase/app";
import { describe, expect, it, vi } from "vitest";
import {
  getAuthActionErrorMessage,
  getAuthErrorMessage,
} from "./auth-error-message";

const ui = {
  locale: enUs,
} as unknown as FirebaseUI;

describe("getAuthErrorMessage", () => {
  it("keeps the translated message of a real Firebase UI failure", () => {
    const error = new FirebaseUIError(
      ui,
      new FirebaseError("auth/invalid-credential", "raw provider detail"),
    );

    expect(error.message).not.toBe("raw provider detail");
    expect(getAuthErrorMessage(error, ui)).toBe(error.message);
  });

  it("does not expose unexpected exception details", () => {
    expect(getAuthErrorMessage(new Error("secret diagnostic"), ui)).toBe(
      enUs.translations.errors?.unknownError,
    );
  });

  it("keeps the translated copy a Firebase UI form action rethrows", () => {
    // Actions rethrow `new Error(error.message)`, losing the FirebaseUIError type.
    const rethrown = new Error("Incorrect password");

    expect(getAuthActionErrorMessage(rethrown, ui)).toBe("Incorrect password");
    expect(getAuthErrorMessage(rethrown, ui)).toBe(
      enUs.translations.errors?.unknownError,
    );
  });

  it("does not expose a non-error action rejection", () => {
    expect(getAuthActionErrorMessage("secret diagnostic", ui)).toBe(
      enUs.translations.errors?.unknownError,
    );
  });
});
