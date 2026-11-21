import { areaBox } from "@/lib/exam/hotspot-geometry";
import type { HotspotArea, HotspotShape, QuestionBody } from "@/types/question";
import {
  hasDuplicates,
  isRecord,
  isStringList,
  parseImage,
  type QuestionFieldErrors,
  readText,
} from "./question-fields";

function isPercent(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && value <= 100;
}

function isPositivePercent(value: unknown): value is number {
  return isPercent(value) && value > 0;
}

function parseRect(value: Record<string, unknown>): HotspotShape | null {
  const { x, y, width, height } = value;
  const fits =
    isPercent(x) &&
    isPercent(y) &&
    isPositivePercent(width) &&
    isPositivePercent(height) &&
    x + width <= 100 &&
    y + height <= 100;
  return fits ? { kind: "rect", x, y, width, height } : null;
}

function parseCircle(value: Record<string, unknown>): HotspotShape | null {
  const { cx, cy, r } = value;
  const fits =
    isPercent(cx) &&
    isPercent(cy) &&
    isPositivePercent(r) &&
    cx - r >= 0 &&
    cx + r <= 100 &&
    cy - r >= 0 &&
    cy + r <= 100;
  return fits ? { kind: "circle", cx, cy, r } : null;
}

function parsePolygon(value: Record<string, unknown>): HotspotShape | null {
  if (!Array.isArray(value.points) || value.points.length < 3) {
    return null;
  }
  const points: { x: number; y: number }[] = [];
  for (const point of value.points) {
    if (!isRecord(point) || !isPercent(point.x) || !isPercent(point.y)) {
      return null;
    }
    points.push({ x: point.x, y: point.y });
  }
  const { width, height } = areaBox({ kind: "polygon", points });
  return width > 0 && height > 0 ? { kind: "polygon", points } : null;
}

function parseShape(value: unknown): HotspotShape | null {
  if (!isRecord(value)) {
    return null;
  }
  if (value.kind === "rect") {
    return parseRect(value);
  }
  if (value.kind === "circle") {
    return parseCircle(value);
  }
  if (value.kind === "polygon") {
    return parsePolygon(value);
  }
  return null;
}

function parseAreas(value: unknown): HotspotArea[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const areas: HotspotArea[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      return null;
    }
    const id = readText(entry.id);
    const label = readText(entry.label);
    const shape = parseShape(entry.shape);
    if (!id || !label || !shape) {
      return null;
    }
    if (entry.explanation !== undefined && !readText(entry.explanation)) {
      return null;
    }
    const explanation = readText(entry.explanation);
    areas.push({ id, label, shape, ...(explanation ? { explanation } : {}) });
  }
  return areas;
}

export function validateHotspotBody(
  raw: Record<string, unknown>,
  errors: QuestionFieldErrors
): QuestionBody | undefined {
  const image = parseImage(raw.image);
  if (!image) {
    errors.image = raw.image === undefined ? "imageRequired" : "invalidImage";
  }

  const areas = parseAreas(raw.areas);
  if (!areas) {
    errors.areas = "invalidAreas";
  } else if (hasDuplicates(areas.map((area) => area.id))) {
    errors.areas = "duplicateId";
  }

  const answer = raw.correctAnswer;
  const knownIds = areas?.map((area) => area.id) ?? [];
  const validAnswer =
    isStringList(answer) &&
    answer.length > 0 &&
    !hasDuplicates(answer) &&
    answer.every((id) => knownIds.includes(id));
  if (!validAnswer) {
    errors.correctAnswer = "invalidCorrectAnswer";
  }

  if (!image || !areas || errors.areas || !validAnswer) {
    return undefined;
  }
  return { type: "hotspot", image, areas, correctAnswer: answer };
}
