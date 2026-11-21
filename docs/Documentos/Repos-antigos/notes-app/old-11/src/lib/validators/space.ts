import type { CreateSpaceInput } from "@/types/space";

/**
 * Stable validation error codes. Callers translate them through the
 * `spaces.validation.*` message keys; this module never holds user-facing copy.
 */
export type SpaceValidationErrorCode =
  | "invalidInput"
  | "validationFailed"
  | "nameRequired"
  | "nameTooLong"
  | "descriptionTooLong"
  | "invalidIcon";

export type SpaceValidationField = "name" | "description" | "icon";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: SpaceValidationErrorCode;
  fieldErrors?: Partial<Record<SpaceValidationField, SpaceValidationErrorCode>>;
}

export const ALLOWED_SPACE_ICONS = [
  "folder",
  "book",
  "briefcase",
  "code",
  "archive",
  "compass",
] as const;

export type AllowedSpaceIcon = (typeof ALLOWED_SPACE_ICONS)[number];

export function validateCreateSpaceInput(
  input: unknown
): ValidationResult<CreateSpaceInput> {
  if (!input || typeof input !== "object") {
    return {
      success: false,
      error: "invalidInput",
    };
  }

  const raw = input as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  const icon = typeof raw.icon === "string" ? raw.icon.trim() : "folder";

  const fieldErrors: NonNullable<ValidationResult<unknown>["fieldErrors"]> = {};

  if (!name) {
    fieldErrors.name = "nameRequired";
  } else if (name.length > 50) {
    fieldErrors.name = "nameTooLong";
  }

  if (description.length > 200) {
    fieldErrors.description = "descriptionTooLong";
  }

  if (icon && !ALLOWED_SPACE_ICONS.includes(icon as AllowedSpaceIcon)) {
    fieldErrors.icon = "invalidIcon";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "validationFailed",
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      name,
      description,
      icon: (icon as AllowedSpaceIcon) || "folder",
    },
  };
}
