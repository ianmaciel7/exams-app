# ADR 0021: Resolve Locale from Browser Preferences

- **Status**: Accepted
- **Date**: 2026-10-30
- **Deciders**: ianmaciel7

## Context

ADR 0004 made the request locale depend only on an explicit server override or
the `NEXT_LOCALE` cookie. A first visit from a browser configured for Brazilian
Portuguese therefore rendered English until the user explicitly saved a profile
preference. The profile's stored locale could also disagree with the cookie,
causing an incorrect-language profile to be briefly revealed.

## Decision

Keep direct, unprefixed routes and do not introduce middleware, a Proxy, or a
`[locale]` segment. Resolve the request locale in this order:

1. An explicit server translation override.
2. A supported `NEXT_LOCALE` cookie value.
3. The supported best match from `Accept-Language`, considering quality values
   and then matching a region-specific locale by its base language.
4. The `en` default locale.

After the authenticated profile loads its saved locale, synchronize a differing
value to `NEXT_LOCALE` and refresh before revealing the profile. This makes the
saved user preference durable without a wrong-language flash.

## Consequences

- First visits honor supported browser preferences, including `pt-BR` and an
  `es-*` regional preference.
- A saved profile preference continues to take precedence after its one-time
  cookie synchronization.
- Request configuration remains dynamic because it already reads cookies; it
  now also reads request headers.
- Unit regressions cover browser preference matching and profile-cookie
  synchronization before the profile card is displayed.

This supersedes only ADR 0004's cookie-only locale-source rule. Its unprefixed
routing and no-Proxy decisions remain in force.
