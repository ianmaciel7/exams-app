import "server-only";

import { NextResponse } from "next/server";
import {
  allowedMethods,
  type Challenge,
  challengeHeader,
  resourceLocation,
  responseHeaders,
  validateJsonMediaType,
} from "@/lib/http-headers";
import {
  evaluatePreconditions,
  rangeAllowed,
  requestedByteRange,
} from "@/lib/http-preconditions";
import { type HttpStatusCode, httpStatus } from "@/lib/http-status";

export type { Challenge } from "@/lib/http-headers";
export { evaluatePreconditions } from "@/lib/http-preconditions";

export type ResponseOptions = Omit<
  NonNullable<Parameters<typeof NextResponse.json>[1]>,
  "status"
> & {
  retryAfter?: number | Date;
  cache?: "no-store" | { visibility: "private" | "public"; maxAge: number };
};

type ErrorBody = { error: string; [key: string]: unknown };

function headersFor(options?: ResponseOptions): Headers {
  const headers = new Headers(options?.headers);
  applyCache(headers, options?.cache);
  if (options?.retryAfter !== undefined)
    headers.set("Retry-After", retryValue(options.retryAfter));
  return responseHeaders(headers);
}

function retryValue(value: number | Date): string {
  if (value instanceof Date) return value.toUTCString();
  if (!Number.isSafeInteger(value) || value < 0)
    throw new TypeError("Retry delay must be a nonnegative safe integer");
  return String(value);
}

function applyCache(headers: Headers, policy: ResponseOptions["cache"]) {
  if (policy === undefined) return;
  if (headers.has("Cache-Control"))
    throw new TypeError("Choose cache or Cache-Control, not both");
  if (policy === "no-store") {
    headers.set("Cache-Control", policy);
    return;
  }
  if (!Number.isSafeInteger(policy.maxAge) || policy.maxAge < 0)
    throw new TypeError("Invalid cache lifetime");
  headers.set(
    "Cache-Control",
    `${policy.visibility}, max-age=${policy.maxAge}`,
  );
}

function json<Body>(
  status: HttpStatusCode,
  body: Body,
  options?: ResponseOptions,
): NextResponse<Body> {
  const headers = headersFor(options);
  validateJsonMediaType(headers);
  if (status === 428) headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...options, headers, status });
}

function jsonResponse(status: HttpStatusCode) {
  return <Body>(body: Body, options?: ResponseOptions) =>
    json(status, body, options);
}

function optionsWithHeader(
  options: ResponseOptions,
  name: string,
  value: string,
): ResponseOptions {
  const headers = new Headers(options.headers);
  headers.set(name, value);
  return { ...options, headers };
}

function emptyResponse(status: 204 | 205) {
  return (options?: ResponseOptions) =>
    new NextResponse(null, {
      ...options,
      headers: headersFor(options),
      status,
    });
}

function redirectResponse(status: 301 | 302 | 303 | 307 | 308) {
  return (destination: string | URL, options?: ResponseOptions) => {
    const location = resourceLocation(destination, true);
    return NextResponse.redirect(location, {
      ...options,
      headers: headersFor(options),
      status,
    });
  };
}

type CreatedOptions = ResponseOptions &
  (
    | { location: string | URL; atRequestUri?: never }
    | { atRequestUri: string | URL; location?: never }
  );

/** Project policy: explicitly identify the resource, including creation at the request URI. */
export function created<Body>(body: Body, options: CreatedOptions) {
  if (
    !options ||
    (options.location === undefined) === (options.atRequestUri === undefined)
  )
    throw new TypeError(
      "Identify the created resource with location or atRequestUri",
    );
  const uri = options.location ?? options.atRequestUri;
  const location = resourceLocation(
    uri as string | URL,
    options.atRequestUri !== undefined,
  );
  return json(201, body, optionsWithHeader(options, "Location", location));
}

/** The status payload should explain progress; monitor is optional, not an RFC MUST. */
export function accepted<Body extends { status: string }>(
  body: Body,
  options?: ResponseOptions & { monitor?: string | URL },
) {
  const responseOptions = options?.monitor
    ? optionsWithHeader(options, "Location", resourceLocation(options.monitor))
    : options;
  return json(202, body, responseOptions);
}

export function unauthorized<Body>(
  body: Body,
  options: ResponseOptions & { challenge: Challenge },
) {
  if (!options?.challenge)
    throw new TypeError("401 requires an authentication challenge");
  return json(
    401,
    body,
    optionsWithHeader(
      options,
      "WWW-Authenticate",
      challengeHeader(options.challenge),
    ),
  );
}

export function methodNotAllowed<Body>(
  body: Body,
  options: ResponseOptions & { allow: readonly string[] },
) {
  if (!options?.allow) throw new TypeError("405 requires allowed methods");
  return json(
    405,
    body,
    optionsWithHeader(options, "Allow", allowedMethods(options.allow)),
  );
}

export function notAcceptable(
  body: ErrorBody & { available: readonly string[] },
  options?: ResponseOptions,
) {
  return json(406, body, options);
}

export function conflict(body: ErrorBody, options?: ResponseOptions) {
  return json(409, body, options);
}

type TooLargeOptions = ResponseOptions &
  ({ temporary: true; retryAfter: number | Date } | { temporary?: false });
export function contentTooLarge(body: ErrorBody, options?: TooLargeOptions) {
  if (options?.temporary && options.retryAfter === undefined)
    throw new TypeError(
      "Temporary 413 responses require retryAfter under project policy",
    );
  return json(413, body, options);
}

export function rangeNotSatisfiable<Body>(
  body: Body,
  options: ResponseOptions & { size: number },
) {
  if (!Number.isSafeInteger(options.size) || options.size < 0)
    throw new RangeError("Invalid representation size");
  const response = json(416, body, options);
  response.headers.set("Content-Range", `bytes */${options.size}`);
  return response;
}

export function unavailableForLegalReasons(
  body: ErrorBody,
  options?: ResponseOptions & { blockedBy?: string | URL },
) {
  const response = json(451, body, options);
  if (options?.blockedBy)
    response.headers.append(
      "Link",
      `<${resourceLocation(options.blockedBy, true)}>; rel="blocked-by"`,
    );
  return response;
}

export type Representation = {
  body: Uint8Array;
  /** Pass the same metadata used for the complete 200 representation. */
  headers: HeadersInit;
  lastModifiedIsStrong?: boolean;
};

function stateFrom(headers: Headers) {
  return {
    exists: true,
    etag: headers.get("ETag") ?? undefined,
    lastModified: headers.get("Last-Modified") ?? undefined,
  };
}

/** null means send the representation; normal cache misses do not throw. */
export function notModified(
  request: Request,
  representationHeaders: HeadersInit,
): NextResponse | null {
  const headers = headersFor({ headers: representationHeaders });
  const status = evaluatePreconditions(request, stateFrom(headers));
  return status === 200 ? null : new NextResponse(null, { status, headers });
}

function fullResponse(
  request: Request,
  representation: Representation,
  headers: Headers,
) {
  return new NextResponse(
    request.method === "HEAD" ? null : representation.body.slice(),
    { status: 200, headers },
  );
}

function rangedResponse(
  request: Request,
  representation: Representation,
  headers: Headers,
) {
  const field = request.headers.get("Range");
  if (request.method !== "GET" || field === null)
    return fullResponse(request, representation, headers);
  if (
    !rangeAllowed(
      request.headers.get("If-Range"),
      headers,
      representation.lastModifiedIsStrong === true,
    )
  )
    return fullResponse(request, representation, headers);
  const range = requestedByteRange(field, representation.body.byteLength);
  if (range === null) return fullResponse(request, representation, headers);
  if (range === "unsatisfied") {
    headers.set("Content-Range", `bytes */${representation.body.byteLength}`);
    return new NextResponse(null, { status: 416, headers });
  }
  headers.set(
    "Content-Range",
    `bytes ${range.start}-${range.end}/${representation.body.byteLength}`,
  );
  return new NextResponse(
    representation.body.slice(range.start, range.end + 1),
    { status: 206, headers },
  );
}

/** Existing GET/HEAD resource: preconditions first, then an optional single byte range. */
export function conditionalResponse(
  request: Request,
  representation: Representation,
): NextResponse {
  if (!["GET", "HEAD"].includes(request.method))
    return methodNotAllowed(
      { error: "Use GET or HEAD" },
      { allow: ["GET", "HEAD"] },
    );
  const headers = headersFor({ headers: representation.headers });
  if (headers.get("Content-Type")?.toLowerCase().startsWith("multipart/"))
    throw new TypeError(
      "Multipart representations require a dedicated implementation",
    );
  if (!headers.has("Content-Type"))
    headers.set("Content-Type", "application/octet-stream");
  headers.set("Accept-Ranges", "bytes");
  const status = evaluatePreconditions(request, stateFrom(headers));
  if (status !== 200) return new NextResponse(null, { status, headers });
  return rangedResponse(request, representation, headers);
}

export const partialContent = conditionalResponse;
export const noContent = emptyResponse(204);
export const resetContent = emptyResponse(205);
export const movedPermanently = redirectResponse(301);
export const found = redirectResponse(302);
export const seeOther = redirectResponse(303);
export const temporaryRedirect = redirectResponse(307);
export const permanentRedirect = redirectResponse(308);

export const ok = jsonResponse(httpStatus.ok);
export const nonAuthoritativeInformation = jsonResponse(
  httpStatus.nonAuthoritativeInformation,
);
export const multipleChoices = jsonResponse(httpStatus.multipleChoices);
export const badRequest = jsonResponse(httpStatus.badRequest);
export const paymentRequired = jsonResponse(httpStatus.paymentRequired);
export const forbidden = jsonResponse(httpStatus.forbidden);
export const notFound = jsonResponse(httpStatus.notFound);
export const requestTimeout = jsonResponse(httpStatus.requestTimeout);
export const gone = jsonResponse(httpStatus.gone);
export const lengthRequired = jsonResponse(httpStatus.lengthRequired);
export const preconditionFailed = jsonResponse(httpStatus.preconditionFailed);
export const uriTooLong = jsonResponse(httpStatus.uriTooLong);
export const unsupportedMediaType = jsonResponse(
  httpStatus.unsupportedMediaType,
);
export const expectationFailed = jsonResponse(httpStatus.expectationFailed);
export const unprocessableContent = jsonResponse(
  httpStatus.unprocessableContent,
);
export const locked = jsonResponse(httpStatus.locked);
export const failedDependency = jsonResponse(httpStatus.failedDependency);
export const preconditionRequired = jsonResponse(
  httpStatus.preconditionRequired,
);
export const tooManyRequests = jsonResponse(httpStatus.tooManyRequests);
export const requestHeaderFieldsTooLarge = jsonResponse(
  httpStatus.requestHeaderFieldsTooLarge,
);
export const internalServerError = jsonResponse(httpStatus.internalServerError);
export const notImplemented = jsonResponse(httpStatus.notImplemented);
export const badGateway = jsonResponse(httpStatus.badGateway);
export const serviceUnavailable = jsonResponse(httpStatus.serviceUnavailable);
export const gatewayTimeout = jsonResponse(httpStatus.gatewayTimeout);
export const httpVersionNotSupported = jsonResponse(
  httpStatus.httpVersionNotSupported,
);
export const variantAlsoNegotiates = jsonResponse(
  httpStatus.variantAlsoNegotiates,
);
export const insufficientStorage = jsonResponse(httpStatus.insufficientStorage);
export const loopDetected = jsonResponse(httpStatus.loopDetected);
