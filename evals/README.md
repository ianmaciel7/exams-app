# Prompt and Agent Evaluation Harness (Evals) — Exam App

This directory provides an **Evaluation-Driven Development (EDD)** harness for prompts, agent behaviors, and domain rules in Exam App.

It supports two execution modes:
1. **Native Zero-Dependency CLI Runner:** Instant, deterministic evaluations with zero setup or downloads.
2. **Promptfoo Integration:** Industry-standard open-source matrix testing, multi-model comparison, and local interactive web UI.

---

## Directory Structure

```
evals/
├── datasets/
│   ├── delegation-contracts.json      # Golden tests for AGENTS.md multi-agent delegation contracts
│   ├── question-provenance.json       # Golden tests for contest question metadata and anti-hallucination
│   └── mock-exam-rules.json           # Golden tests for timer, missed filter transitions, and scoring
├── run-evals.mjs                      # Zero-dependency Node.js test runner with colored metrics output
├── promptfooconfig.yaml               # Standard Promptfoo config (also mirrored in repository root)
└── README.md                          # This documentation
```

---

## 1. Quick Start: Native Runner (Zero Installs)

Run the full evaluation suite directly in your terminal:

```bash
node evals/run-evals.mjs
```

### What is evaluated:
- **Suite 1: Multi-Agent Delegation Contracts (`AGENTS.md`)**
  - Asserts the presence of all 7 mandatory contract fields: `Goal`, `Context & Scope`, `Ownership`, `Tools & Permissions`, `Acceptance Criteria`, `Validation`, and `Return Format`.
  - Flags prohibited patterns (`TODO`, unassigned files, `undefined`).
- **Suite 2: Question Provenance & Anti-Hallucination Integrity**
  - Validates extraction of official metadata (`Year`, `Board`, `Organization`, `Exam`).
  - Strict anti-hallucination guard: ensures missing fields (e.g. absent board) are output as "Not specified" and never invented.
- **Suite 3: Exam Rules, Timer & Scoring Math**
  - Accuracy percentage formula ($(\text{correct} / \text{total}) \times 100$).
  - Missed-questions filter ("Errei") lifecycle (wrong attempt enters filter; subsequent correct attempt exits filter while preserving history).
  - Mock exam timer interruption and resume calculations.

---

## 2. Interactive Web UI: Promptfoo

When you want visual comparison matrices and charts in your browser:

```bash
# 1. Run promptfoo evaluation
npx promptfoo eval

# 2. Open local interactive web dashboard
npx promptfoo view
```

Promptfoo will launch a local server (typically at `http://localhost:15500`) with visual diffs, pass/fail matrices, token usage, and latency tracking.

---

## 3. Adding New Test Cases

To append a new test case, simply add an object to the relevant dataset under `evals/datasets/`:

```json
{
  "id": "tc-prov-03-custom-test",
  "description": "Your test description",
  "raw_input": "...",
  "sample_output": "...",
  "expected_metadata": { ... },
  "forbidden_hallucinations": [ ... ]
}
```

Then rerun `node evals/run-evals.mjs` to verify.

## Scope boundary

Historical domain test suites (mock exams, missed filters, scoring and attempt history) are retained for future evaluation; they do not establish v0.1.0 requirements. See [current release](../docs/releases/v0.1.0/README.md).
