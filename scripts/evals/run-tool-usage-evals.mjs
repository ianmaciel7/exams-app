import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const casesPath = fileURLToPath(
  new URL("../../evals/tool-usage/cases.json", import.meta.url),
);
const schemaPath = fileURLToPath(
  new URL("../../evals/tool-usage/receipt.schema.json", import.meta.url),
);

export function parseJsonl(source) {
  return source
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function stringsIn(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(stringsIn);
  return [];
}

export function findToolEvidence(events) {
  return events.flatMap((event) => {
    const item = event.item;
    // A command that mentions an MCP server is not a successful tool call.
    if (
      event.type !== "item.completed" ||
      item?.type !== "mcp_tool_call" ||
      item.error ||
      item.isError ||
      item.status === "failed"
    ) {
      return [];
    }
    return [item.type, item.server, item.tool]
      .filter(Boolean)
      .map(String)
      .join("\n");
  });
}

export function findReceipt(events) {
  for (const event of [...events].reverse()) {
    const item = event.item ?? event;
    if (
      !String(item.type ?? event.type ?? "")
        .toLowerCase()
        .includes("message")
    )
      continue;
    for (const value of stringsIn(item)) {
      try {
        const receipt = JSON.parse(value);
        if (receipt && Array.isArray(receipt.selected_tools)) return receipt;
      } catch {
        // Progress messages are not evaluation receipts.
      }
    }
  }
}

function matchesAny(value, patterns) {
  return patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

export function scoreCase(testCase, events, exitCode) {
  const receipt = findReceipt(events);
  const traceSelectedTool = matchesAny(
    findToolEvidence(events).join("\n"),
    testCase.expectedToolPatterns,
  );
  const receiptSelectedTool = matchesAny(
    receipt?.selected_tools.join("\n") ?? "",
    testCase.expectedReceiptTools,
  );
  return {
    id: testCase.id,
    passed:
      exitCode === 0 &&
      traceSelectedTool &&
      receiptSelectedTool &&
      Boolean(receipt),
    checks: {
      successfulExit: exitCode === 0,
      traceSelectedTool,
      receiptSelectedTool,
      hasReceipt: Boolean(receipt),
    },
  };
}

export function runCase(testCase, artifactsDirectory, execute = spawnSync) {
  const run = execute(
    "codex",
    [
      "exec",
      "--json",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "--cd",
      root,
      "--output-schema",
      schemaPath,
      `${testCase.prompt}\n\nReturn only the required evaluation receipt JSON.`,
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  const tracePath = resolve(artifactsDirectory, `${testCase.id}.jsonl`);
  mkdirSync(dirname(tracePath), { recursive: true });
  const output = typeof run.stdout === "string" ? run.stdout : "";
  writeFileSync(tracePath, output, "utf8");
  if (run.error) {
    return {
      id: testCase.id,
      passed: false,
      checks: { spawnSucceeded: false },
      error: run.error.message,
    };
  }
  try {
    return scoreCase(testCase, parseJsonl(output), run.status ?? 1);
  } catch (error) {
    return {
      id: testCase.id,
      passed: false,
      checks: { parseableTrace: false },
      error: error.message,
    };
  }
}

function main() {
  const artifactsDirectory = resolve(root, "reports/tool-usage-evals");
  const suite = JSON.parse(readFileSync(casesPath, "utf8"));
  const results = suite.cases.map((testCase) =>
    runCase(testCase, artifactsDirectory),
  );
  const report = {
    version: suite.version,
    passed: results.every((result) => result.passed),
    results,
  };
  writeFileSync(
    resolve(artifactsDirectory, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
