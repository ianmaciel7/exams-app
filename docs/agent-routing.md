# Adaptive agent routing

The project routing policy is in `AGENTS.md`. This document records platform capabilities, configuration matrices, and verification evidence; it does not override host policy or imply automatic switching of the coordinator model.

## Platform capability matrix

| Surface | Native mechanism | Project configuration | Fallback & verification boundary |
| --- | --- | --- | --- |
| Codex | Project `.codex/config.toml` sets default subagent model; `.codex/agents/*.toml` defines explicit subagent profiles. | `default_subagent_model = "gpt-6.2-sol"`; profiles: `light-explorer` (effort low), `code-reviewer` (effort high). | Main session model is configured at launch or by user. Subagent delegation respects profile settings when explicitly invoked. |
| Claude Code | Root `CLAUDE.md` imports `AGENTS.md`; project `.claude/agents/*.md` defines subagents with tool and model frontmatter. | `light-explorer` (haiku, read-only tools), `code-reviewer` (sonnet, quality review). | Main model adheres to session flags. Advisor invocation is manual or triggered by client heuristics on supported tiers. |
| Antigravity | Workspace instructions in `AGENTS.md`; `.agents/agents/*.md` and `.agents/skills/adaptive-routing/SKILL.md`. | `light-explorer` (tier flash), `code-reviewer` (tier pro). | Custom subagent definitions inherit or select supported tiers (`flash`/`pro`). Full coordinator model switching requires user session command. |

## External router evaluation

External routers (such as T3 or custom proxy dispatchers) were evaluated against project requirements:
- Native provider configuration and explicit agent delegation satisfy all tiered routing needs without adding third-party network proxies, external credentials, or runtime runtime dependencies.
- External routing layers introduce external failure modes, latency overhead, and secret management risks.
- Conclusion: External routers remain optional and are not adopted into core project dependencies.

## Validation plan & observations

`evals/adaptive-routing-cases.json` defines test scenarios covering mechanical search, ordinary implementation, complex debugging, high-risk small changes (auth/data integrity), repeated failure recovery, unavailable models, and post-resolution de-escalation.

Observations are evaluated with `node evals/compare-adaptive-routing.mjs <observations.json>`. The comparison validates that adaptive routing maintains 100% correctness without regressions while directing low-risk tasks to lighter tiers and escalating high-risk tasks appropriately.

## Sources

- https://developers.openai.com/codex/guides/agents-md
- https://developers.openai.com/codex/subagents
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/advisor
- https://antigravity.google/docs/subagents
- https://antigravity.google/docs/rules/
