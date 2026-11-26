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

### Recording and comparing observations

Use separate observation files for each client and version. Run each case against the same starting state and acceptance criteria under the fixed-default baseline and the adaptive policy. Record actual client/model/effort and an evidence reference; use `"unknown"` where a host does not expose the model or effort. Assess `correct` against the task acceptance criteria and `routing_appropriate` against the expected decision in the cases file. These are human assessments, not automatically detected routing decisions.

The optional numeric fields `wall_ms`, `tool_calls`, `agent_calls`, and `tokens` must represent measured values, not estimates. Omit unavailable measurements. Keep private prompts and credentials out of observation files. Example structure for each case ID:

```json
{
  "mechanical": {
    "baseline": { "model": "unknown", "effort": "unknown", "correct": true, "routing_appropriate": true, "evidence": "local review reference" },
    "adaptive": { "model": "unknown", "effort": "unknown", "correct": true, "routing_appropriate": true, "evidence": "local review reference" }
  }
}
```

This is a schema example, not a test result. Include every case and run `node evals/compare-adaptive-routing.mjs <observations.json>`. The comparison flags missing cases, negative or invalid measurements, correctness regressions, and inappropriate adaptive decisions. It reports metric totals only when both variants have measurements for every case. It does not execute agents, verify evidence, establish statistical significance, measure cost, or prove runtime instruction discovery. Review evidence separately and record retries and regressions with their case evidence. Do not treat a passing comparison as a completed benchmark without those checks.

### Local CLI inspection

On 2026-11-26 the installed CLIs reported Codex `0.169.0`, Claude Code `2.1.325`, and Antigravity `1.5.16`. Claude's help exposes session-level model and effort flags; their presence does not establish model entitlement, project instruction discovery, or actual selection. The project Codex config contains a subagent default but its effective value has not been observed in a new trusted session. Account entitlements, runtime routing, recursion limits, instruction precedence and billing behavior remain unverified. No inference calls were made for this inspection.

## Sources

- https://learn.chatgpt.com/docs/agent-configuration/subagents
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/advisor
- https://antigravity.google/docs/subagents
