# 0011. Adopt Cookie-Based next-intl Architecture and Firebase Locale Preference Synchronization

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

Previous iterations explored two diverging paths:
1. Hardcoded route prefix routing (`defineRouting` with `localePrefix: "always"` in `old-4`), which required nesting all application routes under `[locale]` segments, complicating deep links, canonical paths, and client routing.
2. In-house typed React context dictionaries without external libraries (`old-9`), which lacked built-in server component request caching, automated ICU formatting, and Next.js App Router middleware integration.

Furthermore, user-visible terminology across spaces and object types must remain localized without mutating canonical English identifiers persisted in IndexedDB/Dexie or remote database models.

## Decision Outcome

We adopt `next-intl` using a cookie-driven request configuration without URL path prefixes, paired with Firebase Authentication user language synchronization following official Firebase recommendations:

1. **Clean URL Strategy**: Routes remain un-prefixed (e.g., `/`, `/editor`, `/settings`). The active locale is resolved on the server in e.g. `src/i18n/request.ts` via the `NEXT_LOCALE` cookie using `next-intl/server` (`getRequestConfig`), falling back to `en` by default.
2. **Supported Locales**: The default locale is `en` (English), with support for `pt-BR` (Portuguese - Brazil) and `es` (Spanish).
3. **Firebase Auth Synchronization**: `auth.useDeviceLanguage()` is called strictly as an initial fallback for unauthenticated guest sessions. When an explicit language preference is set or retrieved from the user's profile document (e.g. Firestore `/users/{uid}`), client handlers assign `auth.languageCode = selectedLocale` on the Firebase `Auth` instance (localizing Auth emails, SMS, reCAPTCHA, and OAuth popups) and synchronize the `NEXT_LOCALE` cookie for server-side `next-intl` rendering.
4. **Canonical Domain Separation**: Persisted entities, database models, and built-in object type records preserve canonical English identifiers (e.g. `singularName`, `pluralName`, `spaceId`), while all UI surfaces (menus, command palette, tabs, notifications, Firebase error codes) resolve dynamic display labels from `src/messages/*.json`.

### Positive Consequences

- Clean, un-prefixed URLs across all application routes without routing noise.
- Server-side translation rendering and request caching via standard `next-intl` server configuration.
- Strict alignment with Firebase Auth SDK conventions (`auth.languageCode` for client auth flows, user DB document for cross-device persistence).
- Clear separation between canonical persisted domain identifiers (English) and localized UI strings.

### Negative Consequences

- Locale switching requires updating the `NEXT_LOCALE` cookie and triggering a client router refresh/re-render.

## Architectural Rules and Invariants

- All UI text strings must be externalized into `src/messages/*.json` translation files.
- Persisted database entities, schema field names, and object type keys must remain strictly in canonical English.
- Active locale must be determined via the `NEXT_LOCALE` cookie managed through e.g. `src/i18n/request.ts`.
- Client Firebase Auth instance language must be set via `auth.languageCode = activeLocale` when user locale is resolved or updated (`useDeviceLanguage()` reserved for guest initialization).

## Related References and Control Documents

- Runtime integration context: [`ARCHITECTURE.md`](../../ARCHITECTURE.md), Sections 3–4.
- Auth UI vendor boundary: see [ADR 0008](./0008-adopt-firebase-ui-components.md).
- FirebaseUI resilience dependency: see [ADR 0010](./0010-adopt-firebase-ui-v7-and-auth-resilience.md).
