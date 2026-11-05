# ADR 0024: Compose the profile Card in the page and keep the client at the leaf

- **Status**: Accepted; amends ADR 0019

## Context

After ADR 0019, `ProfileCardClient` was a client component that received `title` and `description` from `page.tsx`, rendered the shadcn `Card`, and mounted `ProfileForm` once the browser read finished. The Card, header and layout needed no browser state, so the wrapper only forwarded props and pushed static markup into the client bundle.

## Decision

- `page.tsx` composes `Card`, `CardHeader`, `CardTitle`, `CardDescription` and `CardContent` directly as a Server Component.
- `ProfileCardClient` is replaced by `ProfileFormClient`, which owns the browser read through `useProfileFormClient` and renders `LoadingStatus` or `ProfileForm`. The Card header is therefore visible while the profile loads.
- The convention is named **direct page composition, client leaves** and is recorded in `.agents/rules/composition.md`.

## Consequences

- Less client code and a page that shows the whole screen structure.
- `use-profile-card-client.ts` becomes `use-profile-form-client.ts`; behavior (15-second deadline, error boundary, locale and theme sync) is unchanged.
