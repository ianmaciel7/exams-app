# Documentation guide

This guide maps the repository's Markdown documentation to its source of truth.
Project documentation is written in English; locale catalogs use their own
language, as defined in `.agents/rules/language.md`.

## Current guides

| Document | Responsibility | Verify against |
| --- | --- | --- |
| [README](../README.md) | Setup and template adoption | `package.json`, routes, workflows |
| [Architecture](../ARCHITECTURE.md) | Layout, boundaries, and locale behavior | `src/`, `next.config.ts`, `.dependency-cruiser.cjs` |
| [Design](../DESIGN.md) | Implemented tokens, typography, providers, components | CSS, layout, `components.json`, `.ladle/` |
| [Coding standards](../CODING_STANDARDS.md) | Source and test conventions | Biome, TypeScript, accepted decisions |
| [Tooling](../TOOLING.md) | Tools, commands, configuration ownership | `package.json`, configuration, workflows |
| [Testing](../TESTING.md) | Test layers, validation, CI, limitations | Vitest, Playwright, Stryker, workflows |
| [Contributing](../CONTRIBUTING.md) | Branch, commit, and PR conventions | Commitlint, hooks, CI |
| [Security](../SECURITY.md) | Reporting policy and accepted dependency risk | Audit configuration and security workflow |
| [Glossary](../GLOSSARY.md) | Agreed product vocabulary; currently pending | Adopted product terminology |
| [Entity-relationship diagram](../DER.md) | Persistence model; currently pending | Adopted database schema and constraints |
| [Agent instructions](../AGENTS.md) | Repository-wide contributor guidance | Current guides and agent configuration |

## Decisions and agent references

- [ADR index](adr/README.md): eight accepted or partially superseded records.
  They preserve decision history; current versions and commands belong in the
  guides above.
- [Agent configuration](../.agents/README.md): two configured MCP servers,
  persistent rules, and enabled integrations.
- [Skill inventory](../.agents/skills/README.md): five installed skills and
  their provenance. Supporting skill documents remain reusable references
  rather than application configuration.
- [Domain workflow](agents/domain.md) and
  [issue tracker](agents/issue-tracker.md): repository-specific skill context.

## Updating documentation

Update the guide that owns a changed practice in the same change as its
implementation. Check cross-references when renaming paths, adding scripts,
changing locale behavior, or upgrading tools. Read accepted ADRs as records at
their decision date; do not rewrite them to update a dependency version or
operational detail. A changed architectural decision needs a new numbered ADR.

For documentation changes, run:

```bash
pnpm check:markdown
pnpm check:spelling
```

Also verify relative links, referenced files, and command names. The configured
Markdown check excludes `.agents/`, `AGENTS.md`, and ADRs 0001–0005; exclusions
do not remove the need for manual review. Broader CI remains configured on
pull requests even when only Markdown changes.
