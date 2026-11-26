# Context efficiency audit

## Scope and baseline

This audit concerns the local Codex conversation used for Exam App, not all account activity. A session telemetry sample from 2026-11-26 reported 261,794,133 cumulative input tokens, including 259,113,344 cached input tokens, and 258,496 output tokens, including 43,387 reasoning tokens. These are repeated model-call totals, not the size of one prompt, a plan quota or a billing calculation. The last sampled request had 338,987 input tokens against a reported 475,000-token context window. Root-session telemetry does not establish the cost or model actually used by every child agent.

The same recorded session contained 37 subagent creation requests, seven requesting or defaulting to full-history forks, 696 `exec` calls, 139 browser `js` calls, and two compaction records. A browser read exposed a 500-item accessibility tree from a 735-element board. Large recorded tool-result byte counts can include encoded images and must not be equated with tokens. Some repeated checks were necessary after edits; these counts alone do not prove which calls were redundant.

The context-mode report at the audit sample recorded 369 calls, approximately 1.7 MB produced and 1.0 MB returned, with 693.7 KB kept out. Its approximate token conversion and savings cover only its own observed scope, not the entire conversation. RTK's global counters are not a session-specific baseline. Account rate limits are shared and cannot attribute consumption to a particular task.

## Findings and changes

- The previous orchestration wording encouraged a hierarchy even for small tasks, while also allowing a single agent. Project guidance now selects the simplest appropriate approach, retaining required independent evidence and risk-based quality checks.
- Large canvas accessibility output and raw tool output consumed context despite available compression. Guidance now requests focused retrieval, local aggregation and bounded browser observations. The whiteboard visual verification requirements remain in force when applicable.
- Detailed whiteboard instructions were moved, without dropping their requirements, from the always-read project `AGENTS.md` to `docs/boards/whiteboard-guidelines.md`. Agents must read that document before whiteboard changes. In the measured edit, root instructions decreased from 22,764 to 18,949 UTF-8 bytes; this is a file-size measurement, not a measured token or cost saving, and does not account for host-injected instructions.
- Project instructions, history, skills, tools and subagent prompts can repeat context. Reuse verified findings while inputs are unchanged; read required skill instructions and only relevant supporting material. Avoid copying source evidence into multiple documents.
- `context-mode` health checks passed for host configuration, MCP, hooks and index. An update was available, but no evidence linked that version difference to the observed usage; no plugin update was applied. Engram's diagnostic returned 10 successful checks, but some evaluated no sessions; this is not proof that a particular observation was captured.
- The host config lists context-mode, Serena, Engram and CodeGraph as enabled or default-enabled; this checkout has no `.codegraph/` index. `rtk` is installed and the host guidance asks for its command wrapper. The installed `ctx` skill is a separate history/provenance search tool, while Engram stores selected durable memory. These have overlapping retrieval roles, but the inventory alone does not demonstrate a conflict or prove that disabling one would save usage. Use the relevant one for the question rather than repeating the same search across all of them; use context-mode or RTK for large outputs where appropriate.
- The project Codex configuration already sets a lightweight default for subagents. It is host-specific and does not prove the selected model, cost or behavior in a running session; platform policy and explicit overrides take precedence.
- Cache and compaction are controlled by the host. Avoid unnecessary changes to stable instructions and tool sets, but do not claim cache hits or changes to account limits without telemetry.

## Measurement protocol

Run `node scripts/context-metrics.mjs <local-session.jsonl>` on an explicitly selected local Codex transcript. It streams the file and outputs aggregate telemetry only; it does not print conversation text, paths, prompts or tool results. The original log remains private. Output includes recorded input, cached input, output and reasoning fields when present, compactions, subagent requests, tool-result byte totals and malformed-line count. Missing telemetry is not zero. A `spawn_agent` request is not proof of the model used or the total number of model calls.

For a future comparison, use representative tasks of comparable complexity, record the starting and ending aggregate counters, model and context, quality and verification outcomes, elapsed time and any missing data. Compare deltas rather than lifetime totals. Include subagent telemetry separately when the platform exposes it, and never infer plan-limit impact from token counts alone. Test the meter with `node --test scripts/context-metrics.test.mjs`.

## Official references

- [Codex: subagents](https://developers.openai.com/codex/subagents), [OpenAI: multi-agent](https://developers.openai.com/api/docs/guides/responses-multi-agent) and [usage observability](https://developers.openai.com/api/docs/guides/agents-api/observability): delegation adds calls and needs task-appropriate evaluation; session and subagent telemetry are distinct.
- [OpenAI: prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching): unchanged prefixes may be reused, but a session does not guarantee cache hits. API pricing and behavior do not by themselves establish ChatGPT plan limits.
- [Claude Code: troubleshooting](https://code.claude.com/docs/en/troubleshooting): narrow oversized reads and avoid refilling a compacted context with another large result.
- [Google: Antigravity skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills): load task-relevant skills and supporting resources on demand.
