# ADR 0030: Constrain HTTP status helpers

- **Status**: Accepted; amends the optional interruption policy of ADR 0021
- **Date**: 2026-11-06

## Context

A catalog entry does not imply that a JSON body or thrown application error
implements its HTTP semantics. Earlier drafts advertised functions that only
threw, and checked presence rather than complete header grammar.

## Decision

Keep the supplied status catalog, including reserved and temporary values, in
`src/lib/http-status.ts`. Export only functional responses from `src/lib/server.ts`
and native access interrupts from `src/lib/navigation.ts`. Do not synthesize
Next.js digests. Share header validation and pure precondition evaluation in
`http-headers.ts` and `http-preconditions.ts`.

Use structured authentication challenges, explicit creation resource identities,
shared header validation and a default no-store cache policy. The 201 identity
requirement is project policy: HTTP permits omitting Location when the target URI
identifies the new resource. A conditional representation carries the same metadata
as its full response; process preconditions before optional single byte ranges.
Ignore unsupported multipart ranges by returning the full representation.

Enable experimental authInterrupts for native unauthorized/forbidden interrupts.
This does not migrate the session redirects or authentication flow owned by
[ADR 0021](0021-adopt-official-nextjs-server-auth-dal.md). Native unauthorized is
rendering control; use the server helper to supply the HTTP authentication
challenge, and check before streaming when the wire status matters.

## Consequences

Draft-only calls change signatures or disappear. There are no production consumers
of the new response helpers. Reserved and protocol-specific codes remain catalog
entries, not constructor stubs. Helpers default to no-store; callers explicitly
select caching for public or private representations. The complete contracts and
verification boundaries are in [HTTP status helpers](../http-status-helpers.md).
