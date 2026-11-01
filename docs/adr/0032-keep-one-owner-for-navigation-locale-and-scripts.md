# ADR 0032: Keep one owner for navigation, the locale cookie, and package scripts

- **Status**: Accepted
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

Four refactors removed duplicated ownership: pull requests #52 (navigation), #53
(locale cookie), #51 (package scripts), and #55 (message catalogs).

- `src/i18n/navigation.ts` only re-exported `next/link` and `next/navigation`,
  because the locale lives in a cookie and not in the path
  ([ADR 0004](0004-configure-internationalization.md)).
- The profile redirected to sign-in after sign-out and overwrote the return URL
  that the protected guard had set.
- Two code paths wrote `document.cookie` for the locale.
- Alias scripts (`doctor`) and duplicated verification lists drifted apart.
- 38 unused message keys stayed in the catalogs, and the `IntlMessages` type
  augmentation of `next-intl` 3 was ignored.

## Decision

- Import navigation helpers from `next/link` and `next/navigation`. Biome blocks
  `@/i18n/navigation`.
- Only the `(protected)` guard redirects to sign-in, and it keeps `?next=`.
  ast-grep rules `no-protected-descendant-sign-in-redirect-ts` and `-tsx` block
  the same redirect in descendants.
- One helper writes the locale cookie, and the ast-grep rule
  `single-locale-cookie-writer` blocks other `document.cookie` writes.
- `pnpm check:package-scripts` rejects alias scripts and calls to missing scripts.
  `pnpm check:repo` holds the guards shared by `verify:fast` and `verify:static`.
- The catalog test rejects unreferenced message keys, and the `AppConfig`
  augmentation type-checks keys and locales.

## Consequences

- Each behavior has one place to change and one rule that defends it.
- A new alias script or an unused message key fails CI.
- Details live in [CODING_STANDARDS.md](../../CODING_STANDARDS.md) and
  [TOOLING.md](../../TOOLING.md).
