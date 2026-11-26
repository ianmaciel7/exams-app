# Adaptive agent routing

The project routing policy is in `AGENTS.md`. This document records platform capabilities and verification limits; it does not override host policy or imply automatic switching of the coordinator model.

| Surface | Native mechanism | Current project configuration | Verification limit |
| --- | --- | --- | --- |
| Codex | Trusted project `.codex/config.toml` sets a default subagent model; explicit spawn choices take precedence. | `gpt-6.2-sol` default; no project-wide effort override. | Model availability and actual selection depend on session policy and account. A new session is needed to verify effective settings. |
| Claude Code | Root `CLAUDE.md` imports `AGENTS.md`; project subagents may select documented aliases. | Import only; no forced model, advisor, or premium tier. | Confirm import and actual agent model with the client; aliases and access may differ. |
| Antigravity | Workspace instructions and optional workspace subagent definitions. | Shared `AGENTS.md`; no pinned tier or external router. | Verify discovery and available model tiers in the installed surface before claiming enforcement. |

## Validation plan

`evals/adaptive-routing-cases.json` defines cases, not measured results. For each client, compare the same cases under the existing default and the policy, recording selected tier and effort if actually visible, correctness, wall time, retries, tool calls, and usage only if provided by the host. Check high-risk one-line changes, repeated failures, unavailable models, and de-escalation. Do not execute paid API calls or enable premium features without authorization. Mark unavailable observations as unknown.

No complete benchmark or runtime discovery test is claimed by this document. Do not close the routing issue until its remaining acceptance criteria have independent evidence.

## Sources

- https://learn.chatgpt.com/docs/agent-configuration/subagents
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/advisor
- https://antigravity.google/docs/subagents
