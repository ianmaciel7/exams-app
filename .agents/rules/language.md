---
trigger: always_on
description: "Read when writing source comments, documentation, agent artifacts, or commit messages."
---

# Language

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when writing source comments, documentation, agent artifacts, or commit messages.

## Language Policy

Write all source code, code comments, documentation, commit messages, and
agent-facing artifacts in English by default.

Use another language only when the user explicitly requests it or when the
content is intentionally localized. The locale message catalogs under
`src/messages/` are a permitted exception and must use the language of their
respective locale.

`pnpm check:english` enforces this rule in `verify:fast`, `verify:static`, the
lint-staged pre-commit step, and the `commit-msg` hook.
Intentional non-English lines outside `src/messages/` carry a
`check-english-ignore` marker with a reason.
