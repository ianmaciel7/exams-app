# ADR 0034: Record later amendments to the foundation decisions

- **Status**: Accepted; supersedes parts of 0004 and 0009 and extends 0002, 0003, 0006, 0007, and 0010
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

Accepted records 0001 to 0010 are immutable, and ADRs 0011 to 0033 changed, replaced,
or extended some of what they say. Only part of that was visible in the index, so a
reader of 0004 or 0009 could still follow a flow that the code no longer has. This
record lists each case and its owner. It adds no new behavior.

## Decision

Read the older record together with the later one. Where they differ, the later
record wins.

| Older record | What it says | Current rule | Owner |
| --- | --- | --- | --- |
| 0004, item 5 | Localized navigation wrappers live in `src/i18n/navigation.ts`. | The wrapper is removed. Navigation imports `next/link` and `next/navigation`, and Biome blocks `@/i18n/navigation`. | [0032](0032-keep-one-owner-for-navigation-locale-and-scripts.md) |
| 0004, items 1 and 3 | No Proxy, and only the cookie decides the locale. | `Accept-Language` is the fallback, and a header-only Proxy sets the CSP nonce. There are still no locale route segments and no rewrites. | [0021](0021-resolve-locale-from-browser-preferences.md), [0023](0023-enforce-a-nonce-based-content-security-policy.md) |
| 0009, protected routes | The `(protected)` layout observes `onAuthStateChanged`, `requireProtectedAccess` and `requireRole` guard the server, and the profile redirects after sign-out. | `AuthGateClient` owns the session subscription and the single sign-in redirect with `?next=`. `verifySession()` and `verifyRole()` fail closed, and `rejectInvalidBridgeSession()` is the tolerant layout check. The profile no longer redirects. | [0025](0025-separate-bridge-navigation-check-from-session-verification.md), [0032](0032-keep-one-owner-for-navigation-locale-and-scripts.md) |
| 0009, server session | The server verifies the worker-bridge token. | The service worker stays the bridge, with no session cookies and no `FirebaseServerApp`. | [0024](0024-keep-service-worker-firebase-session.md) |
| 0009, role claims | The `role` claim comes from `setUserRole`. | Sign-in is restricted to an allowlist, and addresses in the admin list receive the admin role. | [0017](0017-restrict-sign-in-to-an-email-allowlist.md) |
| 0009, home page | One `auth-nav-button-client.tsx` control. | The hero renders on the server, and session controls load Firebase on demand. | [0026](0026-load-firebase-on-demand-on-the-home-page.md) |
| 0009, usage logging | The protected guard awaits `recordUsage`. | `RouteUsageClient` records usage, and telemetry never gates content. | [0025](0025-separate-bridge-navigation-check-from-session-verification.md) |
| 0010, item 9 | Rules implement the authorization model of 0009. | Emulator tests and a CI guard now prove the rules. | [0028](0028-test-security-rules-and-auth-journeys-on-emulators.md) |
| 0002 and 0003 | Base UI primitives, owned components, theming. | Forms use `Form` and `Field`, loading has one indicator, and `next-themes` receives the CSP nonce. | [0027](0027-build-forms-on-base-ui-form-and-field.md), [0030](0030-use-one-loading-indicator-and-marker.md), [0023](0023-enforce-a-nonce-based-content-security-policy.md) |
| 0006 and 0007 | Test layers, CI, and the ast-grep catalog. | Deploys wait for browser checks, Base UI rules run on staged files, and CI tools stay isolated. | [0022](0022-gate-production-deploys-on-browser-checks.md), [0029](0029-enforce-base-ui-component-rules-with-ast-grep.md), [0033](0033-isolate-ci-tools-from-project-dependencies.md) |

Records 0001, 0005, and 0008 have no case that needs a pointer. The index status of
0004 and 0009 and the clarification list in `docs/adr/README.md` follow this table.

## Consequences

- A reader of an old record finds the current rule from the index and from this table.
- Future amendments add a row here or a new record, and never edit an accepted one.
- Current operational detail stays in the canonical guides, for example
  [docs/auth.md](../auth.md) and [ARCHITECTURE.md](../../ARCHITECTURE.md).
