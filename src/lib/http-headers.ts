const token = "[!#$%&'*+.^_`|~0-9A-Za-z-]+";
const quoted =
  '"(?:[\\x20\\x21\\x23-\\x5b\\x5d-\\x7e\\x80-\\xff]|\\\\[\\x09\\x20-\\x7e\\x80-\\xff])*"';
const jsonMediaType = new RegExp(
  `^application/(?:json|${token}\\+json)(?:[ \\t]*;[ \\t]*${token}=(?:${token}|${quoted}))*$`,
  "i",
);
const httpDate =
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;

export type Challenge = {
  scheme: string;
} & (
  | { parameters?: Readonly<Record<string, string>>; token68?: never }
  | {
      token68: string;
      parameters?: never;
    }
);

export function challengeHeader(challenge: Challenge): string {
  if (!new RegExp(`^${token}$`).test(challenge.scheme))
    throw new TypeError("Invalid authentication scheme");
  if (challenge.token68 !== undefined) {
    if (!/^[A-Za-z0-9._~+/-]+=*$/.test(challenge.token68))
      throw new TypeError("Invalid token68");
    return `${challenge.scheme} ${challenge.token68}`;
  }
  const seen = new Set<string>();
  const params = Object.entries(challenge.parameters ?? {}).map(
    ([name, value]) => {
      if (!new RegExp(`^${token}$`).test(name) || seen.has(name.toLowerCase()))
        throw new TypeError("Invalid or duplicate authentication parameter");
      if (/[^\x20-\x7e\x80-\xff]/.test(value))
        throw new TypeError("Invalid authentication parameter value");
      seen.add(name.toLowerCase());
      return `${name}="${value.replace(/["\\]/g, "\\$&")}"`;
    },
  );
  return [challenge.scheme, params.join(", ")].filter(Boolean).join(" ");
}

export function validateJsonMediaType(headers: Headers) {
  const value = headers.get("Content-Type");
  if (value !== null && !jsonMediaType.test(value))
    throw new TypeError("Expected a valid JSON media type and parameters");
}

export function validateHttpDate(value: string): boolean {
  return (
    httpDate.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toUTCString() === value
  );
}

/** Accept all three HTTP-date formats required for recipients. */
export function parseRequestDate(value: string): number | null {
  if (validateHttpDate(value)) return Date.parse(value);
  const old =
    /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-([A-Z][a-z]{2})-(\d{2}) (\d{2}:\d{2}:\d{2}) GMT$/.exec(
      value,
    );
  if (old) {
    const now = new Date().getUTCFullYear();
    let year = Math.floor(now / 100) * 100 + Number(old[4]);
    if (year > now + 50) year -= 100;
    return parseCanonicalDate(
      `${old[1].slice(0, 3)}, ${old[2]} ${old[3]} ${year} ${old[5]} GMT`,
    );
  }
  const ascii =
    /^([A-Z][a-z]{2}) ([A-Z][a-z]{2}) ([ \d]\d) (\d{2}:\d{2}:\d{2}) (\d{4})$/.exec(
      value,
    );
  if (!ascii) return null;
  return parseCanonicalDate(
    `${ascii[1]}, ${ascii[3].trim().padStart(2, "0")} ${ascii[2]} ${ascii[5]} ${ascii[4]} GMT`,
  );
}

function parseCanonicalDate(value: string): number | null {
  return validateHttpDate(value) ? Date.parse(value) : null;
}

function validateCommonHeaders(headers: Headers) {
  const retry = headers.get("Retry-After");
  if (retry !== null && !/^\d+$/.test(retry) && !validateHttpDate(retry))
    throw new TypeError(
      "Retry-After requires delay seconds or an canonical HTTP date HTTP date",
    );
  const date = headers.get("Date");
  if (date !== null && !validateHttpDate(date))
    throw new TypeError("Invalid HTTP Date");
}

export function responseHeaders(input?: HeadersInit): Headers {
  const headers = new Headers(input);
  for (const name of [
    "Content-Length",
    "Transfer-Encoding",
    "Trailer",
    "Connection",
    "Upgrade",
    "Content-Range",
    "Content-Encoding",
  ]) {
    if (headers.has(name))
      throw new TypeError(
        `${name} requires a dedicated transport or representation implementation`,
      );
  }
  validateCommonHeaders(headers);
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
  return headers;
}

/** Restrict application links to HTTP(S), allowing URI references for Location. */
export function resourceLocation(
  value: string | URL,
  absolute = false,
): string {
  const location = String(value);
  if (!location || /[^\x21-\x7e]/.test(location) || /[<>"\\]/.test(location))
    throw new TypeError("Invalid resource URI");
  const url = absolute
    ? new URL(location)
    : new URL(location, "https://relative.invalid/");
  if (!["http:", "https:"].includes(url.protocol))
    throw new TypeError("Expected an HTTP(S) resource URI");
  return location;
}

export function allowedMethods(methods: readonly string[]): string {
  if (methods.some((method) => !new RegExp(`^${token}$`).test(method)))
    throw new TypeError("Invalid HTTP method");
  return methods.join(", ");
}
