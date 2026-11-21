import type { QuestionImage, QuestionItem } from "@/types/question";

export type QuestionValidationErrorCode =
  | "invalidInput"
  | "validationFailed"
  | "invalidType"
  | "incompatibleField"
  | "promptRequired"
  | "examIdRequired"
  | "invalidOrderIndex"
  | "invalidExplanation"
  | "invalidProvenance"
  | "invalidImage"
  | "imageRequired"
  | "invalidSource"
  | "invalidMetadata"
  | "invalidOptions"
  | "minOptionsRequired"
  | "trueFalseOptionsInvalid"
  | "invalidItems"
  | "invalidSlots"
  | "invalidAreas"
  | "invalidSections"
  | "invalidParts"
  | "invalidTitle"
  | "invalidContext"
  | "invalidDropdowns"
  | "invalidColumns"
  | "invalidRows"
  | "invalidCommands"
  | "duplicateId"
  | "invalidCorrectAnswer";

export type QuestionFieldErrors = Record<string, QuestionValidationErrorCode>;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The trimmed string, or "" when the value is not a string. */
export function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Only `https:` URLs may be rendered as images or links (blocks `javascript:` and `data:`). */
export function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Image sources: `https:` URLs or same-origin paths such as `/seed/diagram.svg`. */
function isImageUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  if (value.startsWith("/")) {
    return !value.startsWith("//");
  }
  return isHttpsUrl(value);
}

export function hasDuplicates(ids: readonly string[]): boolean {
  return new Set(ids).size !== ids.length;
}

export function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === "string" && entry.trim() !== "")
  );
}

export function parseImage(value: unknown): QuestionImage | null {
  if (!isRecord(value)) {
    return null;
  }
  const alt = readText(value.alt);
  if (!isImageUrl(value.url) || !alt) {
    return null;
  }
  return { url: value.url, alt };
}

/** Optional `imageUrl` / `imageAlt` pair shared by options and items. */
export function parseOptionalImage(
  raw: Record<string, unknown>
): { imageUrl?: string; imageAlt?: string } | null {
  if (raw.imageUrl === undefined) {
    return raw.imageAlt === undefined ? {} : null;
  }
  if (!isImageUrl(raw.imageUrl)) {
    return null;
  }
  const imageAlt = raw.imageAlt === undefined ? "" : readText(raw.imageAlt);
  if (raw.imageAlt !== undefined && !imageAlt) {
    return null;
  }
  return { imageUrl: raw.imageUrl, ...(imageAlt ? { imageAlt } : {}) };
}

/** Parses `[{ id, text, imageUrl?, imageAlt? }]`; null when any entry is malformed. */
export function parseItems(value: unknown): QuestionItem[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items: QuestionItem[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      return null;
    }
    const id = readText(entry.id);
    const text = readText(entry.text);
    const image = parseOptionalImage(entry);
    if (!id || !text || !image) {
      return null;
    }
    items.push({ id, text, ...image });
  }
  return items;
}

/** Reports every key of `raw` that is neither common nor allowed for the type. */
export function findIncompatibleKeys(
  raw: Record<string, unknown>,
  allowed: ReadonlySet<string>
): string[] {
  return Object.keys(raw).filter((key) => !allowed.has(key));
}
