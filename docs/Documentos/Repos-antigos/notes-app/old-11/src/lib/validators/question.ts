import {
  type GroundedExplanation,
  QUESTION_TYPES,
  type QuestionBase,
  type QuestionBody,
  type QuestionProperties,
  type QuestionSource,
  type QuestionType,
} from "@/types/question";
import { validateCaseStudyBody } from "./question-case-study";
import { validateChoiceBody, validateFillBlankBody } from "./question-choice";
import {
  findIncompatibleKeys,
  isHttpsUrl,
  isRecord,
  isStringList,
  parseImage,
  type QuestionFieldErrors,
  type QuestionValidationErrorCode,
  readText,
} from "./question-fields";
import {
  validateDragAndDropBody,
  validateDropdownBody,
  validateMatchingBody,
  validateMatrixBody,
  validateOrderingBody,
  validateSimulationBody,
} from "./question-structured";
import { validateHotspotBody } from "./question-visual";

export type { QuestionValidationErrorCode } from "./question-fields";

export type QuestionValidationResult = {
  success: boolean;
  data?: QuestionProperties;
  error?: QuestionValidationErrorCode;
  /** Keyed by the offending property name, including fields foreign to the type. */
  fieldErrors?: Partial<Record<string, QuestionValidationErrorCode>>;
};

const COMMON_KEYS = [
  "type",
  "prompt",
  "promptImage",
  "explanation",
  "source",
  "examId",
  "orderIndex",
  "difficulty",
  "tags",
] as const;

const TYPE_KEYS: Record<QuestionType, readonly string[]> = {
  "single-choice": ["options", "correctAnswer"],
  "multiple-choice": ["options", "correctAnswer"],
  "true-false": ["options", "correctAnswer", "variant"],
  "fill-blank": ["correctAnswer"],
  dropdown: ["dropdowns", "correctAnswer"],
  matching: ["leftItems", "rightItems", "correctAnswer"],
  ordering: ["items", "correctAnswer"],
  "drag-and-drop": ["items", "slots", "correctAnswer"],
  hotspot: ["image", "areas", "correctAnswer"],
  matrix: ["columns", "rows", "correctAnswer"],
  simulation: [
    "scenarioDescription",
    "terminalPrompt",
    "allowedCommands",
    "correctAnswer",
  ],
  "case-study": ["title", "context", "sections", "parts", "correctAnswer"],
};

const PROVENANCES = [
  "official",
  "suggested",
  "community",
  "user",
  "ai",
] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

function isQuestionType(value: unknown): value is QuestionType {
  return QUESTION_TYPES.some((type) => type === value);
}

function parseExplanation(value: unknown): {
  value?: GroundedExplanation;
  error?: QuestionValidationErrorCode;
} {
  if (value === undefined) {
    return {};
  }
  if (!isRecord(value) || !readText(value.text)) {
    return { error: "invalidExplanation" };
  }
  const provenance = PROVENANCES.find((p) => p === value.answerProvenance);
  if (!provenance) {
    return { error: "invalidProvenance" };
  }

  const urls = value.referenceUrls ?? [];
  if (!Array.isArray(urls) || !urls.every(isHttpsUrl)) {
    return { error: "invalidExplanation" };
  }
  return {
    value: {
      text: readText(value.text),
      referenceUrls: urls,
      answerProvenance: provenance,
    },
  };
}

function parseSource(value: unknown): QuestionSource | null {
  if (!isRecord(value)) {
    return null;
  }
  const label = readText(value.label);
  if (!label) {
    return null;
  }
  if (value.url === undefined) {
    return { label };
  }
  return isHttpsUrl(value.url) ? { label, url: value.url } : null;
}

function readOptionalFields(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): Partial<QuestionBase> {
  const optional: Partial<QuestionBase> = {};

  if (raw.promptImage !== undefined) {
    const image = parseImage(raw.promptImage);
    if (image) {
      optional.promptImage = image;
    } else {
      errors.promptImage = "invalidImage";
    }
  }

  const explanation = parseExplanation(raw.explanation);
  if (explanation.error) {
    errors.explanation = explanation.error;
  }
  if (explanation.value) {
    optional.explanation = explanation.value;
  }

  if (raw.source !== undefined) {
    const source = parseSource(raw.source);
    if (source) {
      optional.source = source;
    } else {
      errors.source = "invalidSource";
    }
  }

  const difficulty = DIFFICULTIES.find((d) => d === raw.difficulty);
  if (difficulty) {
    optional.difficulty = difficulty;
  } else if (raw.difficulty !== undefined) {
    errors.difficulty = "invalidMetadata";
  }

  if (isStringList(raw.tags)) {
    optional.tags = raw.tags;
  } else if (raw.tags !== undefined) {
    errors.tags = "invalidMetadata";
  }

  return optional;
}

function readCommonFields(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBase | undefined {
  const prompt = readText(raw.prompt);
  const examId = readText(raw.examId);
  const orderIndex = raw.orderIndex;

  if (!prompt) {
    errors.prompt = "promptRequired";
  }
  if (!examId) {
    errors.examId = "examIdRequired";
  }
  if (
    typeof orderIndex !== "number" ||
    !Number.isInteger(orderIndex) ||
    orderIndex < 0
  ) {
    errors.orderIndex = "invalidOrderIndex";
  }

  const optional = readOptionalFields(raw, errors);
  if (errors.prompt || errors.examId || errors.orderIndex) {
    return undefined;
  }
  if (typeof orderIndex !== "number") {
    return undefined;
  }
  return { prompt, examId, orderIndex, ...optional };
}

function readBody(
  type: QuestionType,
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  switch (type) {
    case "single-choice":
    case "multiple-choice":
    case "true-false":
      return validateChoiceBody(type, raw, errors);
    case "fill-blank":
      return validateFillBlankBody(raw, errors);
    case "dropdown":
      return validateDropdownBody(raw, errors);
    case "matching":
      return validateMatchingBody(raw, errors);
    case "ordering":
      return validateOrderingBody(raw, errors);
    case "drag-and-drop":
      return validateDragAndDropBody(raw, errors);
    case "hotspot":
      return validateHotspotBody(raw, errors);
    case "matrix":
      return validateMatrixBody(raw, errors);
    case "simulation":
      return validateSimulationBody(raw, errors);
    case "case-study":
      return validateCaseStudyBody(raw, errors);
  }
}

/** Validates `Question.properties`, rejecting fields that do not belong to its `type`. */
export function validateQuestionProperties(
  input: unknown
): QuestionValidationResult {
  if (!isRecord(input)) {
    return { success: false, error: "invalidInput" };
  }

  const type = input.type;
  if (!isQuestionType(type)) {
    return {
      success: false,
      error: "validationFailed",
      fieldErrors: { type: "invalidType" },
    };
  }

  const errors: QuestionFieldErrors = {};
  const allowed = new Set<string>([...COMMON_KEYS, ...TYPE_KEYS[type]]);
  for (const key of findIncompatibleKeys(input, allowed)) {
    errors[key] = "incompatibleField";
  }

  const common = readCommonFields(input, errors);
  const body = readBody(type, input, errors);

  if (Object.keys(errors).length > 0 || !common || !body) {
    return { success: false, error: "validationFailed", fieldErrors: errors };
  }
  return { success: true, data: { ...common, ...body } };
}
