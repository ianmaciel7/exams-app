import {
  FirebaseUIError,
  getTranslation,
  type FirebaseUI,
} from "@firebase-oss/ui-core";

/**
 * Keeps expected Firebase failures actionable while preventing unexpected
 * exception details from becoming user-facing authentication copy. Use it for
 * direct `@firebase-oss/ui-core` calls, which rethrow unknown errors unchanged.
 */
export function getAuthErrorMessage(error: unknown, ui: FirebaseUI) {
  if (error instanceof FirebaseUIError) return error.message;
  return getTranslation(ui, "errors", "unknownError");
}

/**
 * For `@firebase-oss/ui-react` form actions. They log unexpected failures and
 * rethrow every failure as a plain `Error` holding translated copy, so the
 * thrown error is never a `FirebaseUIError` here.
 */
export function getAuthActionErrorMessage(error: unknown, ui: FirebaseUI) {
  if (error instanceof Error) return error.message;
  return getTranslation(ui, "errors", "unknownError");
}
