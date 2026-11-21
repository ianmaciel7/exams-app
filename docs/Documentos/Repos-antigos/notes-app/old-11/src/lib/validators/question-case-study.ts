import type {
  CaseStudyPart,
  CaseStudyPartAnswer,
  CaseStudySection,
  QuestionBody,
} from "@/types/question";
import {
  type ChoiceType,
  checkChoiceAnswer,
  checkFillBlankAnswer,
  checkOptions,
} from "./question-choice";
import {
  hasDuplicates,
  isRecord,
  isStringList,
  type QuestionFieldErrors,
  readText,
} from "./question-fields";
import { parseDropdownsList } from "./question-structured";

const CHOICE_PART_TYPES: readonly ChoiceType[] = [
  "single-choice",
  "multiple-choice",
  "true-false",
];

function isChoiceType(value: unknown): value is ChoiceType {
  return CHOICE_PART_TYPES.some((type) => type === value);
}

function parseSections(value: unknown): CaseStudySection[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const sections: CaseStudySection[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      return null;
    }
    const id = readText(entry.id);
    const title = readText(entry.title);
    const content = readText(entry.content);
    if (!id || !title || !content) {
      return null;
    }
    sections.push({ id, title, content });
  }
  return sections;
}

function parsePart(entry: unknown): CaseStudyPart | null {
  if (!isRecord(entry)) {
    return null;
  }
  const id = readText(entry.id);
  const prompt = readText(entry.prompt);
  if (!id || !prompt) {
    return null;
  }
  if (entry.explanation !== undefined && !readText(entry.explanation)) {
    return null;
  }
  const explanation = readText(entry.explanation);
  const base = { id, prompt, ...(explanation ? { explanation } : {}) };

  if (entry.type === "fill-blank") {
    return entry.options === undefined ? { ...base, type: "fill-blank" } : null;
  }
  if (entry.type === "dropdown") {
    const dropdownsResult = parseDropdownsList(entry.dropdowns);
    return typeof dropdownsResult === "string"
      ? null
      : { ...base, type: "dropdown", dropdowns: dropdownsResult };
  }
  if (!isChoiceType(entry.type)) {
    return null;
  }
  const { options, error } = checkOptions(entry.type, entry.options);
  return error ? null : { ...base, type: entry.type, options };
}

function parseParts(value: unknown): CaseStudyPart[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const parts: CaseStudyPart[] = [];
  for (const entry of value) {
    const part = parsePart(entry);
    if (!part) {
      return null;
    }
    parts.push(part);
  }
  return hasDuplicates(parts.map((part) => part.id)) ? null : parts;
}

function readDropdownPartAnswer(
  dropdowns: readonly { id: string; options: readonly { id: string }[] }[],
  answer: unknown
): Record<string, string> | null {
  if (!isRecord(answer)) {
    return null;
  }
  const result: Record<string, string> = {};
  for (const dd of dropdowns) {
    const val = answer[dd.id];
    if (typeof val !== "string" || !dd.options.some((o) => o.id === val)) {
      return null;
    }
    result[dd.id] = val;
  }
  return result;
}

function readPartAnswer(
  part: CaseStudyPart,
  answer: unknown
): CaseStudyPartAnswer | null {
  if (part.type === "fill-blank") {
    const error = checkFillBlankAnswer(answer);
    if (error) {
      return null;
    }
    return isStringList(answer) ? answer : null;
  }
  if (part.type === "dropdown") {
    return readDropdownPartAnswer(part.dropdowns, answer);
  }
  const error = checkChoiceAnswer(part.type, part.options, answer);
  if (error) {
    return null;
  }
  if (typeof answer === "string") {
    return answer;
  }
  return isStringList(answer) ? answer : null;
}

function readPartAnswers(
  value: unknown,
  parts: readonly CaseStudyPart[]
): Record<string, CaseStudyPartAnswer> | null {
  if (!isRecord(value)) {
    return null;
  }
  const entries = Object.entries(value);
  if (entries.length !== parts.length) {
    return null;
  }

  const answers: Record<string, CaseStudyPartAnswer> = {};
  for (const part of parts) {
    const answer = readPartAnswer(part, value[part.id]);
    if (answer === null) {
      return null;
    }
    answers[part.id] = answer;
  }
  return answers;
}

export function validateCaseStudyBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const title = readText(raw.title);
  const context = readText(raw.context);
  if (!title) {
    errors.title = "invalidTitle";
  }
  if (!context) {
    errors.context = "invalidContext";
  }

  const sections = parseSections(raw.sections);
  if (!sections) {
    errors.sections = "invalidSections";
  } else if (hasDuplicates(sections.map((section) => section.id))) {
    errors.sections = "duplicateId";
  }

  const parts = parseParts(raw.parts);
  if (!parts) {
    errors.parts = "invalidParts";
  }

  const answers = parts ? readPartAnswers(raw.correctAnswer, parts) : null;
  if (parts && !answers) {
    errors.correctAnswer = "invalidCorrectAnswer";
  }

  if (!sections || !parts || !answers || Object.keys(errors).length > 0) {
    return undefined;
  }
  return {
    type: "case-study",
    title,
    context,
    sections,
    parts,
    correctAnswer: answers,
  };
}
