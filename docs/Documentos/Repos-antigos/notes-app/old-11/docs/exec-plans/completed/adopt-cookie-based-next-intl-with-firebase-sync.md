# Execution Plan: Adopt Cookie-Based next-intl Architecture and Firebase Locale Sync

**Status:** Completed  
**Owner:** Lead Orchestrator  
**Started:** 2026-09-28  
**Last Updated:** 2026-09-28  

## Objective

Implement clean URL cookie-based `next-intl` internationalization without route prefixes, with server-side locale resolution via `NEXT_LOCALE` cookie, and client-side synchronization with Firebase Auth (`auth.languageCode` for authenticated/configured sessions and `auth.useDeviceLanguage()` for guest fallbacks) as specified in ADR 0011.

## Scope

- In:
  - Install and configure `next-intl` with Next.js App Router plugin (`next.config.ts`).
  - Create `src/i18n/request.ts` server request config reading `NEXT_LOCALE` cookie with fallback to `en`.
  - Add translation dictionary files (`src/messages/en.json`, `src/messages/pt-BR.json`, `src/messages/es.json`).
  - Implement Firebase Auth locale synchronization utilities (`src/lib/i18n/locale-sync.ts`).
  - Update `AuthProvider` (`src/components/notes-app/auth-provider.tsx`) to manage Firebase `auth.useDeviceLanguage()` vs `auth.languageCode`.
  - Update `RootLayout` (`src/app/layout.tsx`) to wrap with `NextIntlClientProvider` and set `<html lang={locale}>`.
  - Create `LanguageSwitcher` component (since replaced by `src/components/notes-app/language-select.tsx`) for language selection across `en`, `pt-BR`, and `es`.
  - Author unit and integration tests for i18n request config, locale sync, auth provider, and UI components.
- Out:
  - Locale URL prefixing (`/pt-BR/...`, `/es/...`), keeping clean un-prefixed URLs.
  - Translating persisted Dexie/IndexedDB database identifiers (preserving canonical English identifiers).

## Canonical Context

- Architecture / ADRs: `docs/adr/0011-adopt-cookie-based-next-intl-with-firebase-sync.md`, `ARCHITECTURE.md`
- Constraints: `CONSTRAINTS.md`, `CONVENTIONS.md`

## Plan

- [x] Install `next-intl` package.
- [x] Create translation files (`src/messages/en.json`, `pt-BR.json`, `es.json`).
- [x] Implement `src/i18n/request.ts` server request config.
- [x] Update `next.config.ts` with `createNextIntlPlugin`.
- [x] Implement `src/lib/i18n/locale-sync.ts` for cookie and Firebase Auth sync.
- [x] Update `AuthProvider` to handle guest `auth.useDeviceLanguage()` and user `auth.languageCode`.
- [x] Update `RootLayout` to load `getLocale()` & `getMessages()` and render `NextIntlClientProvider`.
- [x] Build `LanguageSwitcher` UI component and integrate into `UserMenu` / header.
- [x] Update application components (`AuthGreeting`, `UserMenu`) to resolve strings via `useTranslations`.
- [x] Add Vitest tests for locale sync, i18n request config, and UI components.
- [x] Run full verification suite (`pnpm run check:fast`).

## Progress

- 2026-09-28 — Execution plan created. Installed `next-intl`.
- 2026-09-28 — Added locale sync utilities, request config, messages for `en`, `pt-BR`, and `es`, updated AuthProvider and RootLayout, created LanguageSwitcher component, authored unit tests, and verified full test suite.

## Decision Log

- 2026-09-28 — Adopt `next-intl` without locale path prefixing per ADR 0011. Active locale is resolved server-side from `NEXT_LOCALE` cookie, defaulting to `en`.

## Verification

- [x] Deterministic checks (`check:types`, `check:lint`, `deps:check`, `check:floor`) pass.
- [x] Vitest test suite passes (45 tests in total) with unit coverage for i18n and Firebase auth locale sync.
- [x] Final diff review complete.
- [x] Documentation synchronized.

## Recovery / Rollback

Revert commit or branch if issues arise. Ensure `package.json` lockfile is clean.

## Completion

**Completed:** 2026-09-28  
**Result:** Success — clean URL cookie-based next-intl and Firebase Auth locale synchronization fully implemented and verified.  
