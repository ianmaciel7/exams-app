---
trigger: model_decision
description: "Read when creating, superseding, or referencing architecture decision records."
---

# Architecture decisions

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when creating, superseding, or referencing architecture decision records.

## When an ADR is required

Write the ADR in the same change as the work, before opening the pull request.
Do not leave it for a later step or wait to be asked. An ADR is required when a
change introduces or replaces an architectural, tooling, or infrastructure
choice: a new top-level directory or tool, a new cloud resource model, a new
security boundary, or a decision that supersedes an earlier record.

- Before opening a pull request, check whether the change needs a record and
  run `pnpm check:adr`. The guard fails when an indexed area such as `infra/`
  exists without a record, when an ADR is missing from `docs/adr/README.md`, and
  when numbers have gaps.
- Add a row to `decisionAreas` in `scripts/checks/check-adr.mjs`, with a test in
  `scripts/checks/check-adr.test.mjs`, when a new top-level area needs one.
- The only tracked home for production Firebase Web configuration is
  `apphosting.yaml`: public `NEXT_PUBLIC_*` values that already ship in the client
  bundle. Keep billing, organization, and account identifiers and every credential
  out of it.
- Keep concrete project, billing, organization, and account identifiers out of
  ADRs and every other tracked file.

## ADR Naming and Immutability

Apply this rule when creating an Architecture Decision Record in `docs/adr/`.

- Name each new record `NNNN-<imperative-verb-phrase>.md`.
- Use the next unused four-digit decimal number for `NNNN`. Even though this
  repository is a template, its accepted records still preserve history. Do
  not renumber, rename, consolidate, or rewrite an accepted ADR.
- Use lowercase ASCII kebab case for the phrase. Make it a concise,
  present-tense imperative that describes the implementation stage, for example
  `0006-configure-database-migrations.md` or
  `0007-document-api-versioning.md`.
- Use the heading `# ADR NNNN: <Sentence-case imperative phrase>` inside the
  record.
- Treat accepted ADRs as historical records. When an architectural decision
  changes, add a new ADR describing the context, decision, consequences, and
  superseded scope. Update `docs/adr/README.md`; keep current operational
  details in the canonical guides. A documentation correction or upstream
  reference review does not by itself establish a new architectural decision.

This convention applies to every current and future ADR. The original five ADR
filenames were migrated to this convention on 2026-10-16 at the repository
maintainer's direction.
