# HTTP status helpers

`src/lib/http-status.ts` contains all 64 entries in the supplied reference,
including reserved, obsolete and temporary registrations. Constructors are a
smaller API: unsupported codes have no callable export. The IANA registry could
not be refreshed through the execution environment's proxy.

## Named imports

```ts
import { created, unauthorized, conditionalResponse } from "@/lib/server";

created({ id: "123" }, { location: "/api/users/123" });
created({ id: "123" }, { atRequestUri: "https://example.com/api/users/123" });
unauthorized(
  { error: "Authentication required" },
  {
    challenge: { scheme: "Bearer", parameters: { realm: "api" } },
  },
);
```

The creation identity is an explicit project policy, not a universal RFC MUST
for Location. Authentication parameters are quoted and escaped, token68 is
validated, and parameter names are unique ignoring case. Callers must select
and implement the actual authentication scheme and its scheme-specific rules.

## Headers and caching

All constructors share validation for Date, Retry-After and transport-owned
headers. JSON helpers validate the complete media type including parameters.
Unencoded JSON cannot advertise a content encoding. Framing, upgrades and
successful CONNECT require a dedicated transport implementation.

No Cache-Control is added by default. Set `cache: "no-store"`, `cache: { visibility: "private",
maxAge: 60 }`, a public policy, or explicit Cache-Control headers when appropriate.
Do not supply both cache options and a raw Cache-Control. Set-Cookie alone does
not prevent caching. The 428 helper always forces no-store.

`retryAfter` accepts a nonnegative integer or Date. A raw Retry-After must be
nonempty delay seconds or an canonical HTTP date. This applies to redirects and empty
responses as well as JSON.

## Per-status contracts

- 201: requires exactly one of `location` or `atRequestUri`; emits Location.
  Location can be an HTTP(S) URI reference; atRequestUri must be absolute.
- 202: requires a status payload by project policy; optional `monitor` identifies
  a progress resource. HTTP does not universally require this URL.
- 204 and 205: `noContent()` and `resetContent()` have no body.
- 307: `temporaryRedirect` requires an absolute HTTP(S) URL.
- 401: requires a structured authentication challenge.
- 405: requires `allow`, including an explicit empty list where appropriate.
- 406: payload includes an error and available representations.
- 409: payload describes the conflict; domain resolution details belong to callers.
- 413: a temporary condition requires retryAfter under project policy.
- 416: produced by `conditionalResponse` for unsatisfied byte ranges with Content-Range.
- 451: an explanatory error payload accepts an optional blockedBy URI, emitted as
  a Link with rel=blocked-by. This identifies the blocker, not the legal authority.
- 429/503: retryAfter is supported but is not universally mandatory.

Payload requirements enforce project conventions around RFC recommendations;
they do not imply every RFC SHOULD is a mandatory field.

## Conditional representations and ranges

```ts
return conditionalResponse(request, {
  body: bytes,
  headers: {
    ETag: '"version-1"',
    "Last-Modified": "Thu, 05 Nov 2026 12:00:00 GMT",
    "Content-Type": "application/pdf",
    "Cache-Control": "private, max-age=60",
    Vary: "Accept-Encoding",
  },
});
```

This is for an existing authorized GET/HEAD resource whose other request checks
have already succeeded. Supply the complete representation and the same metadata
that the 200 response would carry. Metadata is retained in conditional and partial
responses. If-Match/If-Unmodified-Since run before cache conditions; If-None-Match
supersedes If-Modified-Since. Matching validators select 304 for GET/HEAD and 412
for unsafe methods. Ordinary cache misses select 200; invalid tag syntax returns
400 and oversized fields return 431. Empty tag-list elements are tolerated and
commas inside opaque tags are preserved.

`evaluatePreconditions(request, { exists, etag, lastModified })` can be called
before a mutation. Only perform the mutation after a 200 verdict and the normal
permission/input checks. The caller owns atomicity between validation and write;
use a transaction or compare-and-swap to avoid lost updates.

`conditionalResponse` does not promise to always produce 206. Single byte ranges support suffixes, open ends and clamping. Invalid,
unknown-unit and unsupported multipart ranges are ignored, returning the full
representation. Valid unsatisfied byte ranges return 416. If-Range requires a
matching strong ETag; date validators also require `lastModifiedIsStrong: true`
from a caller that can establish RFC strong-validator semantics. HEAD has no body
and ignores Range. The response helper does not implement content encoding.

`notModified(request, representationHeaders)` returns a conditional response
(304/412/400/431), or null to continue with the ordinary response. It is a lower
level helper; the representation helper makes this branching unnecessary.

## Navigation and unsupported protocols

Navigation re-exports only unauthorized, forbidden and notFound alongside the
existing route/sign-in helpers. It contains no fake status functions. Native
access interrupts can preserve HTTP 200 after streaming begins. Native unauthorized
has no challenge argument; use the server 401 helper when constructing the HTTP
response. Existing auth redirects and session flows are unchanged.

There are no response constructors for informational responses, WebDAV
multi-status, instance manipulation, protocol upgrades, proxy/network
authentication or reserved/obsolete codes. Implement those protocols at their
proper boundary instead of returning arbitrary JSON with their code.

## Sources and limits

- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html): sections 5.6, 8.3,
  10.2.3, 11, 13, 14 and 15.
- [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html): caching.
- [RFC 6585](https://www.rfc-editor.org/rfc/rfc6585.html): 428 and 429.
- [RFC 7725](https://www.rfc-editor.org/rfc/rfc7725.html): legal restrictions.
- [NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response).

Unit tests cover HTTP contracts and known failure cases; runtime smoke checks are
separate from complete browser/auth/emulator coverage. No finite helper API
certifies all HTTP RFCs, domain decisions, or deployed transport/cache behavior.

The implementation began at local source 28db8036d520652aeaf99e86efd109bd377412d2.
The PR preserves the newer dev snapshot a00d90b166cadc8c6005d7c885811e4b959770f1;
local check results do not certify all intervening upstream changes.
