import {
  FirebaseUIError,
  getTranslation,
  type FirebaseUI,
} from "@firebase-oss/ui-core";

/**
 * Keeps expected Firebase failures actionable while preventing unexpected
 * exception details from becoming user-facing authentication copy.
 */
export function getAuthErrorMessage(error: unknown, ui: FirebaseUI) {
  if (error instanceof FirebaseUIError) return error.message;
  return getTranslation(ui, "errors", "unknownError");
}
