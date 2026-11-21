import type {
  QuestionBody,
  QuestionDropField,
  QuestionItem,
} from "@/types/question";
import {
  hasDuplicates,
  isRecord,
  parseItems,
  type QuestionFieldErrors,
  type QuestionValidationErrorCode,
  readText,
} from "./question-fields";

type ItemsResult = {
  items: QuestionItem[];
  error?: QuestionValidationErrorCode;
};

function checkItems(value: unknown, minimum: number): ItemsResult {
  const items = parseItems(value);
  if (!items || items.length < minimum) {
    return { items: items ?? [], error: "invalidItems" };
  }
  if (hasDuplicates(items.map((item) => item.id))) {
    return { items, error: "duplicateId" };
  }
  return { items };
}

function parseSlots(value: unknown): QuestionDropField[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const slots: QuestionDropField[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      return null;
    }
    const id = readText(entry.id);
    const label = readText(entry.label);
    if (!id || !label) {
      return null;
    }
    slots.push({ id, label });
  }
  return slots;
}

/**
 * A key maps every `keys` id to one `values` id: no missing, extra, or unknown
 * entries. `injective` additionally forbids using one value twice.
 */
function readMapping(
  answer: unknown,
  keys: readonly string[],
  values: readonly string[],
  injective: boolean
): Record<string, string> | null {
  if (!isRecord(answer)) {
    return null;
  }
  const entries = Object.entries(answer);
  if (entries.length !== keys.length) {
    return null;
  }

  const mapping: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (!keys.includes(key)) {
      return null;
    }
    if (typeof value !== "string" || !values.includes(value)) {
      return null;
    }
    mapping[key] = value;
  }
  if (injective && hasDuplicates(Object.values(mapping))) {
    return null;
  }
  return mapping;
}

export function validateMatchingBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const left = checkItems(raw.leftItems, 2);
  const right = checkItems(raw.rightItems, 2);
  if (left.error) {
    errors.leftItems = left.error;
  }
  if (right.error) {
    errors.rightItems = right.error;
  }

  const mapping = readMapping(
    raw.correctAnswer,
    left.items.map((item) => item.id),
    right.items.map((item) => item.id),
    false
  );
  if (!mapping) {
    errors.correctAnswer = "invalidCorrectAnswer";
  }
  if (left.error || right.error || !mapping) {
    return undefined;
  }

  return {
    type: "matching",
    leftItems: left.items,
    rightItems: right.items,
    correctAnswer: mapping,
  };
}

export function validateDragAndDropBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const items = checkItems(raw.items, 1);
  if (items.error) {
    errors.items = items.error;
  }

  const slots = parseSlots(raw.slots);
  if (!slots || slots.length === 0) {
    errors.slots = "invalidSlots";
  } else if (hasDuplicates(slots.map((slot) => slot.id))) {
    errors.slots = "duplicateId";
  }

  const mapping = slots
    ? readMapping(
        raw.correctAnswer,
        slots.map((slot) => slot.id),
        items.items.map((item) => item.id),
        true
      )
    : null;
  if (!mapping) {
    errors.correctAnswer = "invalidCorrectAnswer";
  }
  if (items.error || errors.slots || !slots || !mapping) {
    return undefined;
  }

  return {
    type: "drag-and-drop",
    items: items.items,
    slots,
    correctAnswer: mapping,
  };
}

export function validateOrderingBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const items = checkItems(raw.items, 2);
  if (items.error) {
    errors.items = items.error;
  }

  const valid =
    Array.isArray(raw.correctAnswer) &&
    raw.correctAnswer.length === items.items.length &&
    raw.correctAnswer.every(
      (id) =>
        typeof id === "string" && items.items.some((item) => item.id === id)
    ) &&
    !hasDuplicates(raw.correctAnswer as string[]);

  if (!valid) {
    errors.correctAnswer = "invalidCorrectAnswer";
  }

  if (items.error || !valid) {
    return undefined;
  }

  return {
    type: "ordering",
    items: items.items,
    correctAnswer: raw.correctAnswer as string[],
  };
}

function parseDropdownOptions(
  optionsRaw: unknown
): Array<{ id: string; text: string }> | null {
  if (!Array.isArray(optionsRaw) || optionsRaw.length < 2) {
    return null;
  }
  const options = [];
  for (const opt of optionsRaw) {
    if (!isRecord(opt)) {
      return null;
    }
    const optId = readText(opt.id);
    const text = readText(opt.text);
    if (!optId || !text) {
      return null;
    }
    options.push({ id: optId, text });
  }
  return hasDuplicates(options.map((o) => o.id)) ? null : options;
}

export function parseDropdownsList(list: unknown):
  | Array<{
      id: string;
      label?: string;
      options: Array<{ id: string; text: string }>;
    }>
  | "invalidDropdowns"
  | "duplicateId" {
  if (!Array.isArray(list) || list.length === 0) {
    return "invalidDropdowns";
  }
  const parsed = [];
  for (const dd of list) {
    if (!isRecord(dd)) {
      return "invalidDropdowns";
    }
    const id = readText(dd.id);
    const label = dd.label !== undefined ? readText(dd.label) : undefined;
    const options = parseDropdownOptions(dd.options);
    if (!id || !options) {
      return "invalidDropdowns";
    }
    parsed.push({ id, ...(label ? { label } : {}), options });
  }
  return hasDuplicates(parsed.map((p) => p.id)) ? "duplicateId" : parsed;
}

export function validateDropdownBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const dropdownsResult = parseDropdownsList(raw.dropdowns);
  if (typeof dropdownsResult === "string") {
    errors.dropdowns = dropdownsResult;
    return undefined;
  }

  if (!isRecord(raw.correctAnswer)) {
    errors.correctAnswer = "invalidCorrectAnswer";
    return undefined;
  }

  const keyMap = raw.correctAnswer;
  const validMapping: Record<string, string> = {};

  for (const dd of dropdownsResult) {
    const val = keyMap[dd.id];
    if (typeof val !== "string" || !dd.options.some((o) => o.id === val)) {
      errors.correctAnswer = "invalidCorrectAnswer";
      return undefined;
    }
    validMapping[dd.id] = val;
  }

  return {
    type: "dropdown",
    dropdowns: dropdownsResult,
    correctAnswer: validMapping,
  };
}

export function validateMatrixBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  if (!Array.isArray(raw.columns) || raw.columns.length < 2) {
    errors.columns = "invalidColumns";
  }
  if (!Array.isArray(raw.rows) || raw.rows.length < 1) {
    errors.rows = "invalidRows";
  }
  if (errors.columns || errors.rows) {
    return undefined;
  }

  const columns = (raw.columns as unknown[]).map((col) => {
    if (!isRecord(col)) {
      return null;
    }
    const id = readText(col.id);
    const label = readText(col.label);
    return id && label ? { id, label } : null;
  });

  const rows = (raw.rows as unknown[]).map((row) => {
    if (!isRecord(row)) {
      return null;
    }
    const id = readText(row.id);
    const prompt = readText(row.prompt);
    return id && prompt ? { id, prompt } : null;
  });

  if (columns.some((c) => c === null)) {
    errors.columns = "invalidColumns";
    return undefined;
  }
  if (rows.some((r) => r === null)) {
    errors.rows = "invalidRows";
    return undefined;
  }

  const nonNullCols = columns as Array<{ id: string; label: string }>;
  const nonNullRows = rows as Array<{ id: string; prompt: string }>;

  if (hasDuplicates(nonNullCols.map((c) => c.id))) {
    errors.columns = "duplicateId";
    return undefined;
  }
  if (hasDuplicates(nonNullRows.map((r) => r.id))) {
    errors.rows = "duplicateId";
    return undefined;
  }

  if (!isRecord(raw.correctAnswer)) {
    errors.correctAnswer = "invalidCorrectAnswer";
    return undefined;
  }

  const answerMap = raw.correctAnswer as Record<string, unknown>;
  const validMapping: Record<string, string> = {};

  for (const r of nonNullRows) {
    const val = answerMap[r.id];
    if (typeof val !== "string" || !nonNullCols.some((c) => c.id === val)) {
      errors.correctAnswer = "invalidCorrectAnswer";
      return undefined;
    }
    validMapping[r.id] = val;
  }

  return {
    type: "matrix",
    columns: nonNullCols,
    rows: nonNullRows,
    correctAnswer: validMapping,
  };
}

export function validateSimulationBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const scenarioDescription = readText(raw.scenarioDescription);
  if (!scenarioDescription) {
    errors.scenarioDescription = "promptRequired";
  }

  if (!Array.isArray(raw.allowedCommands) || raw.allowedCommands.length === 0) {
    errors.allowedCommands = "invalidCommands";
  }

  if (!Array.isArray(raw.correctAnswer) || raw.correctAnswer.length === 0) {
    errors.correctAnswer = "invalidCorrectAnswer";
  }

  if (
    errors.scenarioDescription ||
    errors.allowedCommands ||
    errors.correctAnswer
  ) {
    return undefined;
  }

  const allowed = (raw.allowedCommands as unknown[])
    .map(readText)
    .filter(Boolean);
  const correct = (raw.correctAnswer as unknown[])
    .map(readText)
    .filter(Boolean);
  const terminalPrompt = raw.terminalPrompt
    ? readText(raw.terminalPrompt)
    : undefined;

  return {
    type: "simulation",
    scenarioDescription,
    ...(terminalPrompt ? { terminalPrompt } : {}),
    allowedCommands: allowed,
    correctAnswer: correct,
  };
}
