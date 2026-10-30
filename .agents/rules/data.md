---
trigger: model_decision
description: "Read when changing persistence modules, DTOs, schemas, data placement, or dependency injection."
---

# Data access

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing persistence modules, DTOs, schemas, data placement, or dependency injection.

## Data Layer Module Conventions

This section establishes the architectural responsibilities and naming conventions for data access and domain data transfer files across the application.

## Core module responsibilities

When structuring data modeling, access control, and persistence operations, organize code into the following designated files:

| File | Primary Responsibility | Scope & Typical Contents |
| --- | --- | --- |
| `definitions.ts` | **Types, contracts, and schemas** | TypeScript `type` and `interface` definitions, data contracts, and schema validation objects (e.g., Zod schemas) that represent domain models or data shapes. |
| `dto.ts` | **Select and structure transferred data** | Data Transfer Object (DTO) transformers, mappers, and projection functions that sanitize, shape, or format data crossing system or client/server boundaries. |
| `dal.ts` | **Protected data access** | Data Access Layer (DAL) ensuring authorization, permission verification, context validation, and boundary protection before delegating to queries or mutations. |
| `data.ts` | **Data queries and operations** | Low-level queries, persistence interactions, database/SDK operations, and mutation logic. |
| `auth.ts` | **User authentication** | Authentication operations and credential verification ("Who are you?"), user sign-up, sign-in, credential validation, password recovery, and sign-out. |
| `session.ts` | **Session lifecycle & state** | Session management ("Are you authenticated and what is your active session?"), token signing/verification, session storage/cookies, and session persistence. |

## Architectural guidelines

See [auth.md](auth.md) for authentication/session placement and authorization.

1. **Separation of Concerns**:
   - `dal.ts` acts as the security and authorization boundary. Direct client or route calls must pass through the DAL rather than calling `data.ts` directly when sensitive or protected access is involved.
   - `data.ts` focuses strictly on query execution or storage mechanisms without mixing in routing, UI logic, or presentation-level concerns.
   - `dto.ts` ensures internal persistence schemas are not leaked directly to untrusted contexts, projecting and stripping sensitive or internal fields.
   - `definitions.ts` serves as the contract and single source of truth for shapes and validation rules, consumed by `dto.ts`, `dal.ts`, and `data.ts`.
   - `auth.ts` encapsulates authentication operations (login, registration, password recovery, sign-out) to answer user identity challenges.
   - `session.ts` governs session state, expiration, tokens, and cookie persistence, decoupled from specific credential checks or presentation forms.

2. **Locality and Placement**:
   - Keep pure domain types, constants, and guards in dedicated flat modules under `src/lib/` (e.g., `src/lib/role.ts`, `src/lib/locale.ts`, `src/lib/theme.ts`).
   - Keep `src/lib/firebase/` scoped to Firebase SDK initialization and server token verification (`client.ts`, `server.ts`, `admin.ts`, `config.ts`). Do not place route-specific Firestore or Storage operations under `src/lib/firebase/`.
   - For route-private or feature-colocated data access and server route guards, place modules in private `_lib/` folders (e.g., `src/app/(protected)/_lib/dal.ts`, `src/app/(protected)/profile/_lib/data.ts`). Colocate both reads (such as `readProfile` and `readUserPreferences`) and mutations (`saveProfile`, `writeUserPreferences`) in `_lib/data.ts` rather than splitting async reads into a separate `_lib/defaults.ts` file. Enforced by `pnpm check:components` (`inspectLibPlacement`).

3. **`data.ts` Method Naming, Size, and Complexity Budgets**:
   - **Method naming convention**: Every exported function in a `data.ts` module must start with an explicit camelCase operation verb followed by a PascalCase domain noun:
     - **Reads / Queries**: `read<Noun>`, `get<Noun>`, `list<Noun>`, `fetch<Noun>`, `verify<Noun>` (e.g., `readUserPreferences`, `readProfile`).
     - **Writes / Mutations**: `write<Noun>`, `save<Noun>`, `create<Noun>`, `update<Noun>`, `set<Noun>`, `upload<Noun>`, `delete<Noun>`, `remove<Noun>` (e.g., `writeUserPreferences`, `saveProfile`).
   - **Per-function budgets (Biome native)**: Every function in `data.ts` (exported or internal helper) must respect the repository's strict runtime complexity budgets enforced by Biome:
     - **Cognitive complexity**: maximum **8** (`noExcessiveCognitiveComplexity`).
     - **Function body size**: maximum **40 lines** excluding blank lines (`noExcessiveLinesPerFunction`).
     - **Callback nesting depth**: maximum **2** (`noExcessiveNestedCallbacks`).
   - **Per-file size budget**: A `data.ts` module must not exceed **150 non-empty lines** (`inspectDataModuleConventions` in `pnpm check:components`). Decompose pure transformations or unrelated domain operations into focused `_lib/` helpers when approaching this limit.

## Dependency injection and auth subscriptions

- Inject service dependencies at operation boundaries, as in
  `src/app/(protected)/profile/_lib/data.ts`, so logic can be tested independently of
  Firebase. Do not pass service containers through presentational fields.
- Follow [effects.md](effects.md) for subscription lifecycle and loading behavior.

## Route-private support modules

`_lib/` also owns route-private non-hook support declarations, not just persistence
operations. Use descriptive modules such as `avatar.ts` for avatar URL selection
and upload limits, and `profile-session-context.ts` for the shared context object.
Do not place these helpers in hook modules or force them into `data.ts` merely
because they are under `_lib`. Keep actual hooks in `_hooks`; a type-only reference
to a hook return type does not execute that hook or create a runtime dependency.
Enforcement scope is documented in [Component Architecture: Composition, Hooks, and Enforcement](hooks.md#private-hook-module-support-declarations).

## Official references

- [Next.js data security and DAL](https://nextjs.org/docs/app/guides/data-security) (`node_modules/next/dist/docs/01-app/02-guides/data-security.md`)
- [Next.js authentication](https://nextjs.org/docs/app/guides/authentication) (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`)
- [Next.js fetching data](https://nextjs.org/docs/app/getting-started/fetching-data) (`node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`)
- [Next.js mutating data](https://nextjs.org/docs/app/getting-started/mutating-data) (`node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`)
