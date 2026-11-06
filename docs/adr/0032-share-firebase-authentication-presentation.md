# ADR 0032: Share Firebase authentication presentation

- **Status**: Accepted; amends the component placement conventions of ADR 0006
- **Date**: 2026-11-06

## Context

Public authentication presentation was colocated with its route integrations.
The maintainer requested that neutral forms, fields and Firebase presentation
live together in `src/components/firebase`, while browser integrations retain
route ownership. Moving files alone would leave shared presentation importing
route components and private hook types, violating the dependency boundary.

## Decision

Place owned authentication presentation, including `ForgotPasswordForm`,
`SignInForm` and `RegisterForm`, in `src/components/firebase`. Keep Firebase
operations, context access and orchestration in route-private client components
and hooks. Shared forms receive policy and social-login content as React node
slots. Presentation prop types do not depend on private route hooks.

Allow the directory in the component placement guard, while retaining the ban
on integration suffixes and explicit server/client-only boundaries. Apply owned
component conventions, structural checks, lint and application coverage to these
files, including the redundant client-directive check. Preserve existing shadcn
and AI Elements exclusions without treating Firebase presentation as generated.

## Consequences

Authentication presentation can be reused and tested without Firebase context.
Routes supply the integrations without creating imports from shared components
back into `src/app`. Presentation remains part of the client graph when imported
by a client integration; placement does not turn it into a Server Component.
The existing Firebase operations and server authorization model are unchanged.
