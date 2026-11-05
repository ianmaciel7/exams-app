# ADR 0027: Invert the profile data dependency with a gateway port

- **Status**: Accepted; amends ADRs 0019 and 0025

## Context

After ADR 0025, `useProfileForm` (the form's UI hook) read and wrote the profile
through `readProfile` and `saveProfile`, which call the browser Firebase SDK. A
UI hook therefore performed external communication directly, which breaks the
Dependency Inversion Principle (DIP) already required in `CODING_STANDARDS.md`.
The guards missed it because the Biome import restriction covered only route
entrypoints (`page.tsx`, `layout.tsx`, `template.tsx`), not hooks or components.

## Decision

- `_lib/definitions.ts` declares the `ProfileGateway` port (`read`, `save`).
- `_lib/data.ts` exports the adapter `firebaseProfileGateway`.
- `ProfileGatewayProviderClient` (composition root) provides the adapter through
  a React context; `useProfileGateway` reads it, as `useSession` reads the
  session. `useProfileLoad`, `useProfileRead` and `createProfileAction` use only
  the port, so tests inject a fake gateway.
- A Biome `noRestrictedImports` override forbids `firebase`, `firebase/*`,
  `@/lib/firebase/client` and `_lib/data` in `src/app/**/_hooks` and
  `_components`, except `*-provider-client.tsx` and tests.
- The Middle Man check ignores context providers (`*Context` tags): they inject
  a dependency and are not pass-through wrappers.

## Consequences

- UI hooks have no knowledge of Firebase; replacing the backend touches only
  the adapter and the provider.
- One more small provider component wraps the profile `Card` in `page.tsx`.
