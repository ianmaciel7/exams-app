# ADR 0023: Classify analysis without file exclusions

- **Status**: Accepted; amends the analysis scope of ADR 0010 and ADR 0022
- **Date**: 2026-11-05

## Context

Removing every analyzer exclusion exposed diagnostics in application code,
registry primitives, tests, external skill bundles and generated data. Applying
application orchestration budgets to all these inputs made CI fail before it
could run behavior tests. The maintainer approved analyzing every file with
rules appropriate to each category.

## Decision

Keep Biome's full file coverage. Application runtime code retains error-level
complexity, hook correctness and localization rules. Tests, stories and copied
registry code report complexity and literal-text findings as warnings. Primitive
accessibility heuristics remain visible warnings because wrappers receive their
labels, keyboard behavior and roles through composition; browser accessibility
acceptance remains blocking. Application-owned UI extensions retain strict rules.
External skill bundle diagnostics remain visible without treating generated
implementation patterns as application code. Negative Semgrep fixtures retain
intentionally unsafe examples with explicit fixture context.

Keep React correctness errors blocking in registry code. Replace unstable
calendar component factories with module-level components, adopt React 19 ref
props, repair Effect dependencies and render chart CSS as style children rather
than raw HTML. Remove the unused highlighter implementation instead of hiding it.

Report coverage for every source file. Apply the existing 70 percent thresholds
to application routes, hooks, libraries, localization and owned UI extensions.
Copied library coverage stays visible and is not presented as application
acceptance coverage. Keep all unit, browser, emulator, E2E and security suites.

Knip reads actual CSS imports and MCP executable declarations through compilers
in knip.ts. Its host-tool list distinguishes installed system tools from npm
packages; no application file is excluded. The Stryker command runner is bundled
with its core package, not a missing dependency.

CSpell checks translations and technical names with explicit vocabulary. For
generated graph, emulator and report JSON, inspect linguistic fields such as
titles and descriptions instead of treating hashes and serialized code as prose.
Do not exclude those files from analysis.

## Consequences

Warnings are visible review work, not claims that every diagnostic is resolved.
Safe formatting normalizes existing source and documentation. New regressions
verify category severity, formatted skill inventories, calendar identity and
chart markup safety. Browser and production checks must pass before promotion.
