# Documentation guide

This guide maps the repository's Markdown documentation to its source of truth.
Project documentation is written in English; locale catalogs use their own
language, as defined in `.agents/rules/language.md#language-policy`.

## Current guides

| Document | Responsibility | Verify against |
| --- | --- | --- |
| [README](../README.md) | Setup and template adoption | `package.json`, routes, workflows |
| [Architecture](../ARCHITECTURE.md) | Layout, boundaries, and locale behavior | `src/`, `next.config.ts`, `.dependency-cruiser.cjs` |
| [Design](../DESIGN.md) | Implemented tokens, typography, providers, components | CSS, layout, `components.json`, `.ladle/` |
| [Coding standards](../CODING_STANDARDS.md) | Source and test conventions | Biome, TypeScript, accepted decisions |
| [Tooling](../TOOLING.md) | Tools, commands, configuration ownership | `package.json`, configuration, workflows |
| [Testing](../TESTING.md) | Test layers, required Firebase Emulator E2E, CI limitations | Vitest, Playwright, Firebase, Stryker, workflows |
| [Contributing](../CONTRIBUTING.md) | Branch, commit, and PR conventions | Commitlint, hooks, CI |
| [Security](../SECURITY.md) | Reporting policy and accepted dependency risk | Audit configuration and security workflow |
| [Firebase continuous delivery](firebase-cd.md) | Production release configuration and prerequisites | `firebase-cd.yml`, GitHub Environment, Firebase project |
| [Glossary](../GLOSSARY.md) | Agreed product vocabulary; currently pending | Adopted product terminology |
| [Entity-relationship diagram](../DER.md) | Pending product model and existing technical Firebase stores | Current SDK modules, Security Rules, and adopted domain constraints |
| [Agent instructions](../AGENTS.md) | Repository-wide contributor guidance | Current guides and agent configuration |
| [React rules](../.agents/rules/react.md) | Focused React constraints; on-demand guides in `docs/agents/` | Installed React/DOM/Compiler, native Biome diagnostics |
| [Next.js rules](../.agents/rules/cache.md) | Installed version-matched App Router and diagnostic rules | Installed Next.js, Context7, current config |
| [shadcn/ui rules](../.agents/rules/shadcn.md#shadcnui-maintenance) | Base UI boundaries, component contracts, composition | Installed CLI, current component registry |

## Application operations

- Observability and runtime logging: structured Firebase usage events, server error
  boundaries, and deployment requirements are detailed in [Architecture](../ARCHITECTURE.md)
  and verified in `functions/usage-logs.test.cjs`.

## Review evidence

The old `docs/reviews/` and `docs/code-review/` report archives are not included
in this checkout. Do not infer completed audit coverage from references to those
archives. The [coverage map](agents/coverage.md) describes documentation ownership;
it does not certify a full source-code audit.

Use current CI results and [Testing](../TESTING.md) for executable validation.
The manual **Review Validation** workflow checks current source, documentation
links, and the installed skill inventory without requiring historical reports.

## Decisions and agent references

- [Agent reference index](agents/README.md): on-demand React sources, feature
  selection, review, version applicability, research procedures, and rule loading.

- [ADR index](adr/README.md): accepted template architecture decisions.
  Accepted records preserve their original context; current versions and
  commands belong in the guides above.
- [Agent configuration](../.agents/README.md): four configured MCP servers,
  persistent rules, and enabled integrations.
- [Skill inventory](../.agents/skills/README.md): the installed skills and
  their provenance. Supporting skill documents remain reusable references
  rather than application configuration.
- [Domain workflow](agents/domain.md) and
  [issue tracker](agents/issue-tracker.md): repository-specific skill context.
- Tool evaluations: regression scenarios and assertions are exercised via
  `scripts/evals/run-tool-usage-evals.test.mjs` (`pnpm test:evals`).

## Updating documentation

Update the guide that owns a changed practice in the same change as its
implementation. When changing an architectural rule, update
[Testing](../TESTING.md), the executable fixtures, the
[tool inventory](../TOOLING.md), and the relevant agent rule in the same PR.
Never document planned behavior as a passing CI check. Check cross-references when renaming paths, adding scripts,
changing locale behavior, or upgrading tools. Preserve accepted ADRs without
rewriting or renumbering them. Record a changed architectural decision in a new
ADR and update the ADR index with its supersession scope. Documentation
clarifications and upstream reference refreshes alone do not require an ADR.

For documentation changes, run:

```bash
pnpm check:markdown
pnpm check:spelling
```

Also verify relative links, referenced files, and command names. The configured
Markdown and spelling checks include project rules and agent entrypoints while
excluding external skill content. Accepted ADRs retain their historical wording;
explicit historical source-link mappings are maintained by the documentation guard. Broader CI remains configured on
pull requests even when only Markdown changes.
