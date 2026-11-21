# Testing Strategy & Guidelines

This file owns **how behavior is verified**. Blocking thresholds belong to
`CONSTRAINTS.md`; security scanning policy belongs to `SECURITY.md`.

## 1. Verification Model

The repository follows a multi-track testing strategy with a clear division of testing responsibilities:

- **Unit Tests & Scoped Coverage (Vitest >=80%)**: Enforced on business logic, data transformers, custom hooks, and state management (`src/lib/**/*.ts`, `src/hooks/**/*.ts`). Synchronous Client Components and utility functions are tested in Vitest with `vi.mock('next/navigation')` for `useRouter`/`usePathname`. Next.js invariant: `async` Server Components are not supported in Vitest unit suites and must be tested via E2E.
- **Component Workbench & Visual Verification (Ladle)**: Declarative UI primitives under `src/components/ui/` are developed, previewed, and tested for accessibility and themes via isolated Ladle stories (`*.stories.tsx`).
- **End-to-End Testing (Playwright)**: Full browser user journeys, Next.js App Router async Server Components, route transitions, Server Actions, and Firebase Auth local emulator interactions verified under `e2e/`.
- **Quality Floors & Automated Guards**: Enforced via `scripts/guards/floor-guard.mjs` and `scripts/hooks/hooks.test.mjs` (merge-base non-regression, path protection, native-subagent delegation guard, Biome auto-formatting hooks, and the run-outcome classifiers that keep the Firestore-rules and typecheck hooks from blocking on environment failures).
- **Audits & Mutation Verification**: Lighthouse CI for production-browser accessibility/performance auditing; StrykerJS mutation testing for focused production logic.

Agent behavioral evaluations are configured separately under `.agents/evals/`.

### Rendering and Async Verification

- Test a `<Suspense>` fallback as observable behavior: the fallback appears while
  the deferred region is pending, then the region resolves without losing the
  surrounding shell. Do not assert React's internal scheduling details.
- When a route adds a segment loading boundary, verify the initial load and client
  navigation with Playwright. Confirm that the loading UI is scoped to the route
  segment and that the segment error boundary remains the failure path rather than
  a loading substitute.
- When a component introduces `useTransition`, `useActionState`, or optimistic
  updates, test the pending, success, interruption, and failure states. Keep the
  input responsive while the non-urgent region updates.
- Verify parallel async work through the rendered outcome and, where timing is a
  requirement, a deterministic test double that records start order. Avoid flaky
  sleep-based assertions for streaming.
- Vitest remains appropriate for synchronous Client Components and hooks; use
  Playwright for async Server Components, route streaming, Server Actions, and
  browser-level navigation behavior.

## 2. Toolchain

- **Vitest**: unit test runner and scoped V8 coverage reporter.
- **Ladle**: component story workbench.
- **Playwright**: end-to-end (E2E) browser testing framework with Next.js webServer lifecycle management ([ADR 0012](./docs/adr/0012-adopt-playwright-for-e2e-testing.md)).
- **StrykerJS**: mutation testing.
- **Lighthouse CI**: production-browser audit.
- **Automated Guards**: custom floor, React Server Component boundary, component-prop, component-naming, notes-app composition/state ownership, conventions, i18n-string, no-emoji, and repository hook guards (`scripts/guards/floor-guard.mjs`, `scripts/guards/guard-adr-plan.mjs`, `scripts/guards/guard-rsc-boundaries.mjs`, `scripts/guards/guard-component-props.mjs`, `scripts/guards/guard-component-naming.mjs`, `scripts/guards/guard-notes-app-pattern.mjs`, `scripts/guards/guard-conventions.mjs`, `scripts/verify/verify-conventions-index.mjs`, `scripts/guards/guard-i18n-strings.mjs`, `scripts/guards/guard-no-emojis.mjs`, `scripts/hooks/hooks.test.mjs`).
- **Documentation verifier**: `scripts/verify/verify-docs.mjs` runs the control-doc verifiers plus repository-wide markdown checks (links and anchors, referenced paths and `pnpm` commands, path portability, English-only text, `AGENTS.md` size and skill routing, skill frontmatter, and the `docs/` tree rules for ADRs, execution plans, and product specs). Its logic is covered by `scripts/verify/verify-docs.test.mjs`.
- **Harness eval runner**: provider-neutral Node runner with Codex and Antigravity adapters.

Exact versions are owned by `package.json`.

## 3. Commands

```bash
rtk pnpm test
rtk pnpm test:watch
rtk pnpm test:coverage
rtk pnpm test:e2e
rtk pnpm test:firebase-emulator
rtk pnpm test:mutation
rtk pnpm ladle
rtk pnpm ladle:build
rtk pnpm lighthouse
rtk pnpm test:harness
rtk pnpm test:guards
rtk pnpm verify:docs
rtk pnpm check:ci
```

Live model behavioral evals are separate from normal PR CI:

```bash
rtk pnpm eval:codex
rtk pnpm eval:antigravity
```

Use the smallest relevant subset during development. Task-end/merge requirements and
numeric thresholds are owned by `CONSTRAINTS.md` and `CONTRIBUTING.md`.

## 4. File Conventions

- Unit tests are colocated under `src/` as `*.test.ts` or `*.test.tsx`, with scoped coverage enforced on `src/lib/**/*.ts` and `src/hooks/**/*.ts`.
- End-to-end test specifications are located under `e2e/` as `*.spec.ts`.
- Component stories for `src/components/ui/` primitives are colocated as `*.stories.tsx`. Stories for application components live under `src/stories/` because the component guards require one component per file under `src/components/`, and Ladle discovers `src/**/*.stories.tsx`.
- The current unit-test foundation includes `src/lib/utils.test.ts`, `src/hooks/use-auth.test.ts`, `src/hooks/use-require-auth.test.tsx`, `src/lib/firebase/auth-emulator.test.ts`, and `src/app/(auth)/login/page.test.tsx`.
- Declarative UI primitives under `src/components/ui/` should add or update a Ladle story when visual or interaction behavior needs verification.

## 5. Firebase Authentication Testing Strategy

The repository employs a multi-layered testing strategy for Firebase Authentication:

- **State Observer Lifecycle & Context Hooks**:
  - `AuthProvider` (`src/components/notes-app/auth-provider.test.tsx`, context defined in `src/lib/auth-context.ts`) verify subscriber initialization, authentication state propagation, and child component rendering under authenticated and unauthenticated states.
  - `useAuth` hook (`src/hooks/use-auth.test.ts`) verifies context boundary enforcement (throwing errors when invoked outside `AuthProvider`).
  - `useRequireAuth` hook (`src/hooks/use-require-auth.test.tsx`) verifies route protection behavior, triggering navigation redirects for unauthenticated sessions while allowing access to authenticated users.

- **Local Emulator Integration**:
  - Integration suites (`src/lib/firebase/auth-emulator.test.ts` and `src/lib/firebase/firestore-emulator.test.ts`) and the exam dual-write suite (`src/lib/firebase/attempts-emulator.test.ts`, which checks that an Attempt append and its Card FSRS update commit atomically under `firestore.rules`) exercise real Firebase SDK behavior against the Auth (`127.0.0.1:9099`) and Firestore (`127.0.0.1:8080`) emulators. The attempt rules also reject an unknown `questionType`, a non-boolean `isCorrect`, and a `submittedAnswer` whose `type` differs from `questionType` ([ADR 0018](./docs/adr/0018-unified-question-type-system.md)).
  - Question types: `src/lib/validators/question.test.ts` covers a valid case per type, missing fields, wrong option counts, unknown correct answers, duplicate ids, a missing hotspot image, and fields foreign to the type; `src/lib/exam/evaluate-answer.test.ts` covers full-set grading and fill-blank normalization; `src/components/notes-app/question/question-card.test.tsx` renders each type and checks roles, names, keyboard-accessible controls, and feedback; `src/lib/exam/seed-questions.test.ts` validates every seeded question; `scripts/tooling/migrate-questions.test.mjs` covers the legacy migration.
- `pnpm run test:firebase-emulator` owns deterministic emulator lifecycle through a pinned `firebase-tools` version and is part of `check:ci`; ordinary unit runs may remain emulator-independent.
  - Verifies anonymous authentication (`signInAnonymously`), user account creation (`createUserWithEmailAndPassword`), credential authentication (`signInWithEmailAndPassword`), and session cleanup (`signOut`).
  - Includes a pre-check ping to gracefully skip execution when the emulator daemon is unreachable in isolated unit environments.

- **Component-Level Login Workflows**:
  - Login page component suite (`src/app/(auth)/login/page.test.tsx`) tests authentication interaction patterns and mode toggling (`signIn` vs `signUp`).
  - Verifies primary popup sign-in flows using `signInWithPopup`.
  - Verifies resilient fallback to `signInWithRedirect` selected by Firebase error code (`auth/popup-blocked`, `auth/popup-closed-by-user`, `auth/operation-not-supported-in-this-environment`), with the `No matching frame` message as the only message-based signal.
  - Verifies failures are surfaced: a translated error alert is shown (and the error is captured, not shown raw) when popup sign-in, the redirect fallback, `getRedirectResult`, or anonymous sign-in fails; `auth/cancelled-popup-request` stays silent.
  - Verifies guest access via `signInAnonymously`.
  - Verifies post-redirect credential processing via `getRedirectResult` and post-login routing according to the `next` query parameter, including rejection of unsafe `next` URLs.
  - The root error boundary suite (`src/app/error.test.tsx`) verifies the generic message does not leak the raw error.

## 6. Test Design

- Test observable behavior rather than implementation details.
- Dedicated application hooks are tested as the owner of state transitions, effects, navigation, and state-derived handlers. Components that consume those hooks should test rendered states and user-visible interactions rather than duplicate the hook's internal state-machine assertions.
- Base UI `render` composition should be tested through behavior (for example, a rendered `DialogClose` button actually closes the dialog), not by asserting implementation-specific wrapper markup.
- Keep unit tests deterministic and isolated.
- Mock `next/navigation` (`useRouter`, `useSearchParams`, `usePathname`) using Vitest spies when verifying client navigation behavior.
- Add integration tests when multiple application boundaries must be verified
  together rather than forcing that behavior into unit mocks.
- Add E2E coverage under `e2e/` with Playwright to verify full browser user flows, async Server Components, Server Action mutations, and emulator interactions.
- Avoid over-mocking; there is currently no product network/database layer to mock.

## 7. Automation Status

`.github/workflows/quality.yml` runs the deterministic repository gate (`pnpm check:ci`) on pull requests and the main development branches. It includes types, Biome CI lint/format verification, architecture, the diff floor, unit tests, duplication, repository-wide documentation verification, evaluator/guard tests, Firebase Auth/Firestore emulator integration tests, coverage, agent-config materialization/drift verification, and a production build.

Ladle visual review, Lighthouse, mutation testing, and live model behavioral trials remain risk/cadence-based rather than every-PR gates. Agent-behavior evaluations live under `.agents/evals/`; they use multiple independent trials and score traces plus workspace outcomes rather than final prose alone.
