# ADR 0031: Report usage after the user action

- **Status**: Accepted; amends ADR 0029
- **Date**: 2026-11-06

## Context

ADR 0029 made the e-mail change await the `recordUsage` callable before asking
Firebase to send the confirmation, and surfaced a telemetry failure through the
dialog's retry flow. When the callable failed (an outage, a cold start past its
15 s timeout, App Check or quota rejection), no confirmation was sent and the
user saw only "Could not save the profile". Telemetry is client-reported usage,
never an authorization guard or proof of success, so it had no reason to decide
the outcome of the action it describes.

Every test missed it. The profile tests mocked `@/lib/auth`, the auth unit test
mocked both the SDK and telemetry and asserted the blocking order as a policy,
and no emulator journey changed an e-mail address.

## Decision

`sendEmailChangeVerification` asks Firebase to send the confirmation first and
then reports usage without awaiting it; a telemetry failure is logged only.
The ast-grep rule `no-awaited-usage-telemetry` rejects `await trackEvent(...)`
anywhere in `src`.

An emulator journey in `tests/firebase-auth.spec.ts` changes the address with the
telemetry callable refused, reads the emulator's `VERIFY_AND_CHANGE_EMAIL`
code, opens its link and requires the profile to show the new address.

## Consequences

A logging outage no longer blocks the e-mail change. The address still changes
only after the user opens the link, as before. Usage for a failed attempt is not
reported, which matches "usage, not proof of success".
