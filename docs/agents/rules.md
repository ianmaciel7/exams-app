# Rule loading

Keep one context per Markdown file under `.agents/rules/`, with short descriptive
names and no topic subdirectories. The index maps tasks to rules and references.
A guide or catalog should not become a universally loaded rule.

## Antigravity

The current [official rules guide](https://antigravity.google/docs/rules?tab=ide)
supports immediate `.agents/rules/*.md` files with `trigger` and `description`.
Use `model_decision` for topic guidance; only the path and description are indexed
upfront. Use `glob` for a precise file pattern, `manual` for explicit invocation,
and `always_on` only for short universal requirements. The rule index is manual.
Every rule needs valid YAML metadata: the official guide states that missing or
invalid `trigger` values cause a rule to be discarded. `AGENTS.md` itself remains
plain Markdown, without that metadata.

## Codex

[Codex instruction discovery](https://github.com/openai/codex/blob/main/codex-rs/core/src/agents_md.rs)
uses scoped `AGENTS.md` files. Keep the explicit topic reading map in the root
`AGENTS.md`; linking a file does not automatically import its contents.

## Claude Code

The current [official memory guide](https://code.claude.com/docs/en/memory) supports
`AGENTS.md` directly. With the default `claude-md-or-agents-md` project-instructions
mode, Claude reads `AGENTS.md` when there is no `CLAUDE.md` or `CLAUDE.local.md` in
the working directory or above it. If one exists, the default selects Claude's
instruction files instead. Other project-instructions settings can change this.
This documents current upstream behavior, not a verified installed-client version.

When a Claude entrypoint is needed, a sibling `CLAUDE.md` can import `@AGENTS.md`
to reuse the existing reading map. No duplicate topic rules or unconditional
imports of the full rule directory are needed. Do not create a second entrypoint
merely because older guidance assumed AGENTS support was unavailable.

Native `.claude/rules/` files use `paths` for conditional loading; those without
`paths` load at launch. Antigravity's `trigger` metadata does not define Claude's
native activation behavior. Keep one topic per file and test actual loading in
the client when its executable and session are available.

## Verification

Run the Markdown, spelling, and language checks documented in `TOOLING.md`,
including explicit coverage of files excluded by the default checks. Verify
relative links and heading anchors after moves. Follow the configured Agents CLI
workflow when available; do not claim client materialization or runtime activation
without observing it. This reorganization does not install clients or change MCP servers.
