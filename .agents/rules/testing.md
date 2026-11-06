---

trigger: model_decision
description: "Read before testing or changing stateful user journeys, asynchronous interactions, external authentication, cancellation, or recovery."
---

# Behavioral testing and recovery

The authoritative testing strategy and acceptance model are in
[TESTING.md](../../TESTING.md#stateful-user-journeys-and-model-based-acceptance).

Repository checks use `scripts/checks/check-*.mjs` with colocated
`check-*.test.mjs` regressions. `pnpm check:repo` discovers new files through
`scripts/run-checks.mjs`; do not add them to a manual command chain. Modules
must be safe to import and expose a guarded CLI. The default mode is `repo`;
export `checkMode = "manual"` for checks requiring a server or deployment,
or `checkMode = "helper"` for libraries invoked by another check. Their
offline regression suites still run automatically. Keep external tool
execution in its existing owning command.

Colocated tests are named after the file they test (`page.tsx` is tested by
`page.test.tsx`; a variant such as `.browser` is allowed). `check-test-names`
enforces it; a suite that deliberately spans several modules needs an entry
with a reason in its `exceptions` map.

Before implementing or changing a user-facing or asynchronous workflow, or one
with multiple steps, enumerate the relevant states, events, transitions and transition
pairs. Define success, cancellation, failure, and recovery expectations
independently of the existing implementation. Prioritize risk and document
uncovered transitions. Test critical behavior through observable user outcomes
and an appropriate real integration, not only mocked callbacks.

After cancellation or failure, verify that the user can **retry** the action
without a stuck spinner, disabled control, unauthorized state, or stale session.

The executable safeguard is the relevant behavioral regression in
`tests/firebase-auth.spec.ts`, exercised by the required `auth-emulator`
CI job. Do not skip, weaken, or replace a failing acceptance scenario with
an assertion about implementation details merely to make CI green.

For external calls whose failures are intentionally caught, require an explicit
integration acknowledgment as well as the user-visible result. Usage telemetry
is covered by `tests/firebase-usage.spec.ts` in the same required emulator job:
browser CORS, accepted/rejected calls, outage isolation, and recovery must remain
observable. Coverage percentages and mocked SDK calls do not prove transport.

Read [ui-state.md](ui-state.md) for cross-cutting feedback and accessible
presentation guidance. `pnpm check:ui-state` runs in `verify:fast`,
`verify:static`, and the CI `static` job. It catches only direct raw exception
coercion in JSX, form error, and toast sinks; it does not establish complete
interaction coverage or accessibility conformance.

## Analyzer exclusions

Do not exempt copied registry components from Biome, React Doctor, coverage,
jscpd, Fallow, Knip, or CSpell. Follow the current tool exclusion policy in
`TOOLING.md`; Git tracking exclusions are independent of analyzer scope.

## CI maintenance

For new Browser Mode dependencies, pre-bundle their entrypoints in
`vitest.config.mts` and verify the entire browser suite with a fresh cache.
Keep React and React DOM deduplicated. Unexpected optimizer reloads invalidate
the run; do not replace this check with only a warm-cache focused test.

Keep shared setup in `.github/actions/` and suite ownership in `.github/workflows/ci.yml`. Preserve the fail-closed CI result gate and run `node --test scripts/ci/check-results.test.mjs` when changing its policy. Key download caches by tool version and inputs; never skip verification on a cache hit.

## Analysis categories

All files remain analyzed. Application runtime rules are blocking; test, story,
registry and external-bundle style or complexity findings remain visible as
warnings. Registry React correctness, browser acceptance and security checks
remain blocking. Full-source coverage is reported with the existing 70 percent
floor applied to application code. Knip parses CSS imports and MCP declarations;
its explicit host-tool list does not exclude source files. Generated JSON spelling
checks inspect linguistic fields, while translations have explicit vocabulary.
See [ADR 0023](../../docs/adr/0023-classify-analysis-without-file-exclusions.md).
