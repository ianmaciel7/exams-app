import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  findReceipt,
  findToolEvidence,
  parseJsonl,
  runCase,
  scoreCase,
} from "./run-tool-usage-evals.mjs";

const testCase = {
  id: "DOC-01",
  expectedToolPatterns: ["context7"],
  expectedReceiptTools: ["context7"],
};
const receipt = {
  selected_tools: ["Context7"],
  evidence: ["query-docs completed"],
  outcome: "Documentation found.",
  limitation: "None.",
  validation: "Trace inspected.",
};

describe("tool-usage eval runner", () => {
  it("parses JSONL events", () => {
    assert.deepEqual(parseJsonl('{"type":"a"}\n{"type":"b"}\n'), [
      { type: "a" },
      { type: "b" },
    ]);
  });

  it("finds a structured receipt in a completed message", () => {
    assert.deepEqual(
      findReceipt([
        {
          type: "item.completed",
          item: { type: "agent_message", text: JSON.stringify(receipt) },
        },
      ]),
      receipt,
    );
  });

  it("keeps tool-call evidence separate from prose", () => {
    const events = [
      {
        type: "item.completed",
        item: {
          type: "agent_message",
          text: "Context7 and Playwright were mentioned in prose.",
        },
      },
      {
        type: "item.completed",
        item: { type: "mcp_tool_call", server: "context7", tool: "query-docs" },
      },
    ];
    assert.deepEqual(findToolEvidence(events), [
      "mcp_tool_call\ncontext7\nquery-docs",
    ]);
  });

  it("rejects command-name matches and failed or incomplete MCP events", () => {
    const failures = [
      {
        type: "item.completed",
        item: { type: "command_execution", command: "echo context7" },
      },
      {
        type: "item.started",
        item: { type: "mcp_tool_call", server: "context7", tool: "query-docs" },
      },
      {
        type: "item.failed",
        item: { type: "mcp_tool_call", server: "context7", tool: "query-docs" },
      },
      {
        type: "item.completed",
        item: {
          type: "mcp_tool_call",
          server: "context7",
          tool: "query-docs",
          error: "denied",
        },
      },
      {
        type: "item.completed",
        item: {
          type: "mcp_tool_call",
          server: "context7",
          tool: "query-docs",
          status: "failed",
        },
      },
    ];
    assert.deepEqual(findToolEvidence(failures), []);
    const events = [
      ...failures,
      {
        type: "item.completed",
        item: { type: "agent_message", text: JSON.stringify(receipt) },
      },
    ];
    assert.equal(scoreCase(testCase, events, 0).passed, false);
  });

  it("writes an empty trace and a failed result when the external executable is missing", () => {
    const directory = mkdtempSync(join(tmpdir(), "eval-runner-"));
    try {
      const result = runCase(testCase, directory, () => ({
        stdout: null,
        status: null,
        error: new Error("spawn codex ENOENT"),
      }));
      assert.equal(result.passed, false);
      assert.equal(result.checks.spawnSucceeded, false);
      assert.match(result.error, /ENOENT/);
      assert.equal(readFileSync(join(directory, "DOC-01.jsonl"), "utf8"), "");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("passes only when exit, trace, and receipt agree", () => {
    const events = [
      {
        type: "item.completed",
        item: { type: "mcp_tool_call", server: "context7", tool: "query-docs" },
      },
      {
        type: "item.completed",
        item: { type: "agent_message", text: JSON.stringify(receipt) },
      },
    ];
    assert.equal(scoreCase(testCase, events, 0).passed, true);
    assert.equal(scoreCase(testCase, events, 1).passed, false);
    assert.equal(scoreCase(testCase, [events[1]], 0).passed, false);
  });

  it("scores multi-hop MCP tool sequences across multiple servers", () => {
    const multiCase = {
      id: "MULTI-01",
      expectedToolPatterns: [
        "graphify.*serena|serena.*context7|graphify|serena",
      ],
      expectedReceiptTools: ["graphify", "serena", "context7"],
    };
    const multiReceipt = {
      selected_tools: ["Graphify", "Serena", "Context7"],
      evidence: [
        "query_graph mapped pipeline",
        "find_symbol verified body",
        "query-docs verified SDK",
      ],
      outcome: "Multi-hop cross-server trajectory succeeded.",
      limitation: "None.",
      validation: "Trace inspected.",
    };
    const events = [
      {
        type: "item.completed",
        item: {
          type: "mcp_tool_call",
          server: "graphify",
          tool: "query_graph",
        },
      },
      {
        type: "item.completed",
        item: { type: "mcp_tool_call", server: "serena", tool: "find_symbol" },
      },
      {
        type: "item.completed",
        item: { type: "mcp_tool_call", server: "context7", tool: "query-docs" },
      },
      {
        type: "item.completed",
        item: { type: "agent_message", text: JSON.stringify(multiReceipt) },
      },
    ];
    assert.equal(scoreCase(multiCase, events, 0).passed, true);
  });

  it("rejects shell command execution as a distractor for symbolic navigation", () => {
    const distractCase = {
      id: "DISTRACT-01",
      expectedToolPatterns: ["serena|graphify"],
      expectedReceiptTools: ["serena|graphify"],
    };
    const distractReceipt = {
      selected_tools: ["shell"],
      evidence: ["cat src/lib/auth.ts"],
      outcome: "Read via shell.",
      limitation: "Used distractor.",
      validation: "None.",
    };
    const events = [
      {
        type: "item.completed",
        item: { type: "command_execution", command: "cat src/lib/auth.ts" },
      },
      {
        type: "item.completed",
        item: { type: "agent_message", text: JSON.stringify(distractReceipt) },
      },
    ];
    assert.equal(scoreCase(distractCase, events, 0).passed, false);
  });
});
