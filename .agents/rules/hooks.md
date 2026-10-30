---
trigger: model_decision
description: "Read when implementing or refactoring custom hooks and component behavior ownership."
---

# Custom hooks

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when implementing or refactoring custom hooks and component behavior ownership.

## Component behavior and custom hooks

Owned components keep rendering, translations, primitive prop forwarding and simple UI composition. Place stateful effects, Firebase operations and asynchronous workflow handlers in responsibility-specific custom hooks. Focused hooks compose inside the component-named orchestration hook described below; do not restore a single controller that owns every field and action.

- Expose explicit session flags (`isLoading`, `isHidden`, `isError`) and an
  already resolved error message. Components render the applicable flag rather
  than deriving readiness from user, authentication and preferences flags.
- Keep responsibilities local: `useProfileStatus` derives the profile session
  flags; `useProfileFormClient` owns the React Hook Form lifecycle
  and uses `formState.isSubmitting` rather than a parallel saving flag;
  `useProfileAvatarFieldClient` handles avatar field data. Do not mirror
  derived state in additional `useState` variables.
- `check:components` rejects React state/effect imports (including aliases), namespace state/effect calls, Firebase value imports, async workflow functions, compound `if` conditions/derived locals and error fallbacks inside owned component functions. Async Server Components, simple discriminated-state branches, translations, form context and presentation props such as `disabled={disabled || pending}` remain valid.
- The guard checks syntax, not arbitrary semantic equivalence or the ideal number of hooks. Generated Firebase/UI registries and Next.js special files retain their existing scope exclusions. Module-level setup is outside component branch analysis.

## Component-named orchestration hooks

A component coordinating application behavior must use the imported
`use<ComponentName>` hook in a separate module. For example,
`ProfileSectionClient` calls `useProfileSectionClient`, which composes
`useProfileSession`, `useProfileStatus`, and translations, and resolves
conditional properties (such as `userId`) so component JSX remains free of
inline `in` operator guards or ternary expressions. Stateful avatar
fields, save actions, and auth flows use focused hooks; simple display name,
email, locale, and theme fields do **not** need one-line wrappers around
standard hooks. This is a stricter project policy, not a React rule.

`check:components` checks the imported orchestration hook's canonical name,
including aliased imports, and rejects unrelated application orchestration
hooks alongside it. Any number of supported presentation hooks
(`useId`, `useTranslations`, `useFormatter`, `useFormContext`,
`useWatch`) may be used directly without a wrapper, including alongside
the one named application hook. The current AST implementation recognizes
specific syntax; it is not a proof of all React hook semantics. Scope
exclusions still apply. For example, `HomeClient` delegates
application orchestration to `useHomeClient`.

## Private hook module support declarations

Route-private `_hooks/**/*.ts` and `.tsx` modules contain hook implementations,
imports, exports and types. Move module-level support functions and values to
that route's `_lib/`: this includes constants, lookup collections and React
context objects. A filename starting with `use-` does not make helpers inside
that module part of the hook. `getAvatarSource` and avatar limits live in
`profile/_lib/avatar.ts`; the session context object lives in
`profile/_lib/profile-session-context.ts`.

The hook itself may be a named `useX` function declaration or a `useX` variable
initialized directly with an arrow/function expression. Local constants,
handlers, closures and lifecycle callbacks inside the hook remain valid. Do not
move code that depends on hook-local state merely to satisfy a module-level rule.

The blocking ast-grep rules `no-module-support-in-hooks-ts` and `-tsx` run in
`check:structure`, already included in fast/static verification. They inspect
top-level declarations, including exported declarations, and intentionally exclude
test/spec/story files and directories outside App Router private `_hooks`.
Type declarations and imports are allowed. This is project architecture policy,
not a React rule, a purity analysis, or proof that every `useX` function is a hook.
Wrapped factory expressions are not accepted as direct hook declarations.

## Main hooks and focused sub-hooks

Keep a component's main hook as an orchestrator over focused sub-hooks. Separate
independent initialization, subscriptions/navigation, locale synchronization,
preference loading and successful save feedback into their actual responsibility
owners. Keep derived render values in the main hook where appropriate; do not
move a pure helper into a new hook solely to reduce a function's metric.

The native budgets, exclusions and verified examples are owned by
[Coding standards](../../CODING_STANDARDS.md#owned-function-complexity-and-hook-responsibility-trees).
Biome enforces cognitive complexity, function size and callback nesting on both
orchestrators and their support modules. Those syntactic budgets do not establish
that a function has a single responsibility; review its dependencies and lifecycle
as well. Preserve cancellation, stale-result checks and authorization checks at
asynchronous boundaries during refactoring.

For every hook change, inventory the affected responsibility tree and validate all
owned hook directories and support modules. Do not finish with only the named
example or a changed-file lint result. Run the full Biome source/configured project
scan and the private hook structure rules; CI already uses these complete scopes.
Include existing hooks, new sub-hooks and shared hooks in the check. Preserve the
documented registry exclusions, and report global blockers separately from a
passing complexity scan. Main-hook cohesion and lifecycle ownership still need
manual review beyond the numeric checks.
