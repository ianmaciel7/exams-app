import { parseRequestDate, validateHttpDate } from "@/lib/http-headers";

export type RepresentationState = {
  exists: boolean;
  etag?: string;
  lastModified?: string;
};

const entityTag = /^(?:W\/)?"[\x21\x23-\x7e\x80-\xff]*"$/;
const listItem =
  /[ \t]*(?:,|(?:W\/)?"[\x21\x23-\x7e\x80-\xff]*"[ \t]*(?:,|$))/y;
const maxFieldLength = 16_384;

export function validETag(value: string): boolean {
  return entityTag.test(value);
}

/** Ignore empty list elements without splitting commas inside quoted tags. */
function parseTags(value: string): string[] | null {
  value = value.trim();
  if (value === "*") return ["*"];
  const result: string[] = [];
  let offset = 0;
  while (offset < value.length) {
    listItem.lastIndex = offset;
    const match = listItem.exec(value);
    if (!match) return null;
    const tag = match[0].trim().replace(/,$/, "").trim();
    if (tag) result.push(tag);
    offset = listItem.lastIndex;
  }
  return result.length ? result : null;
}

function tagMatches(
  value: string,
  state: RepresentationState,
  weak: boolean,
): boolean | null {
  const tags = parseTags(value);
  if (!tags) return null;
  if (tags[0] === "*") return state.exists;
  if (!state.exists || !state.etag) return false;
  return tags.some((tag) =>
    weak
      ? tag.replace(/^W\//, "") === state.etag?.replace(/^W\//, "")
      : !tag.startsWith("W/") && tag === state.etag,
  );
}

function unmodified(
  value: string | null,
  state: RepresentationState,
): boolean | null {
  if (value === null || !state.lastModified) return null;
  const limit = parseRequestDate(value);
  if (limit === null) return null;
  return Date.parse(state.lastModified) <= limit;
}

function matchPreconditions(
  request: Request,
  state: RepresentationState,
): number | null {
  const match = request.headers.get("If-Match");
  if (match !== null) {
    const matches = tagMatches(match, state, false);
    if (matches === null) return 400;
    if (!matches) return 412;
  } else if (
    unmodified(request.headers.get("If-Unmodified-Since"), state) === false
  )
    return 412;
  return null;
}

function cachePreconditions(
  request: Request,
  state: RepresentationState,
): number | null {
  const noneMatch = request.headers.get("If-None-Match");
  if (noneMatch !== null) return noneMatchStatus(request, state, noneMatch);
  if (!["GET", "HEAD"].includes(request.method) || !state.exists) return null;
  return unmodified(request.headers.get("If-Modified-Since"), state) === true
    ? 304
    : null;
}

function noneMatchStatus(
  request: Request,
  state: RepresentationState,
  value: string,
): number | null {
  const matches = tagMatches(value, state, true);
  if (matches === null) return 400;
  if (!matches) return null;
  return ["GET", "HEAD"].includes(request.method) ? 304 : 412;
}

/** Evaluate before performing a mutation. Other request checks must already have passed. */
export function evaluatePreconditions(
  request: Request,
  state: RepresentationState,
): number {
  if (state.etag !== undefined && !validETag(state.etag))
    throw new TypeError("Invalid representation ETag");
  if (state.lastModified !== undefined && !validateHttpDate(state.lastModified))
    throw new TypeError("Invalid Last-Modified");
  if (
    [...request.headers.values()].some((value) => value.length > maxFieldLength)
  )
    return 431;
  return (
    matchPreconditions(request, state) ??
    cachePreconditions(request, state) ??
    200
  );
}

export type ByteRange = { start: number; end: number };

function explicitRange(
  first: string,
  last: string,
  size: number,
): ByteRange | "unsatisfied" | null {
  const start = Number(first);
  const end = last ? Number(last) : Math.max(0, size - 1);
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    (end < start && last !== "")
  )
    return null;
  if (start >= size) return "unsatisfied";
  return { start, end: Math.min(end, size - 1) };
}

function suffixRange(
  length: string,
  size: number,
): ByteRange | "unsatisfied" | null {
  const count = Number(length);
  if (!Number.isSafeInteger(count)) return null;
  if (!count || !size) return "unsatisfied";
  return { start: Math.max(0, size - count), end: size - 1 };
}

/** null means ignore the range; unsatisfied means a valid range has no bytes. */
export function requestedByteRange(
  value: string,
  size: number,
): ByteRange | "unsatisfied" | null {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(value);
  if (!match || !(match[1] || match[2])) return null;
  return match[1]
    ? explicitRange(match[1], match[2], size)
    : suffixRange(match[2], size);
}

/** HTTP-date If-Range needs explicit assurance that Last-Modified is a strong validator. */
export function rangeAllowed(
  value: string | null,
  headers: Headers,
  lastModifiedIsStrong: boolean,
): boolean {
  if (value === null) return true;
  if (validETag(value))
    return !value.startsWith("W/") && value === headers.get("ETag");
  return (
    lastModifiedIsStrong &&
    parseRequestDate(value) !== null &&
    parseRequestDate(value) === Date.parse(headers.get("Last-Modified") ?? "")
  );
}
