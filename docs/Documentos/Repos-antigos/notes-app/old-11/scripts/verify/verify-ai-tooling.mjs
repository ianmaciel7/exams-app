#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));

const checks = [];

function record(name, pass, detail = "") {
  checks.push({ name, pass, detail });
  const icon = pass ? "✓" : "✗";
  console.log(`${icon} [${name}] ${detail}`);
}

console.log("=== Verifying AI Tooling & RTK Protocol ===");

// 1. RTK Version Check
try {
  const rtkVersion = spawnSync("rtk", ["--version"], {
    encoding: "utf8",
    shell: true,
  });
  const pass = rtkVersion.status === 0 && rtkVersion.stdout.includes("rtk");
  record(
    "rtk-binary",
    pass,
    pass ? rtkVersion.stdout.trim() : "Failed to run rtk --version"
  );
} catch (e) {
  record("rtk-binary", false, e.message);
}

// 2. RTK Execution Wrapping Check
try {
  const rtkExec = spawnSync(
    "rtk",
    ["node", "-e", "console.log('RTK_WRAPPING_PASSED')"],
    {
      encoding: "utf8",
      shell: true,
    }
  );
  const pass =
    rtkExec.status === 0 && rtkExec.stdout.includes("RTK_WRAPPING_PASSED");
  record(
    "rtk-execution-wrapping",
    pass,
    pass ? "rtk successfully executed sub-process" : "rtk wrapping failed"
  );
} catch (e) {
  record("rtk-execution-wrapping", false, e.message);
}

// 3. AGENTS.md & RTK.md Invariants Check
try {
  const agentsMd = await readFile(path.join(root, "AGENTS.md"), "utf8");
  const rtkMd = await readFile(path.join(root, "RTK.md"), "utf8");
  const hasAgentsMandate =
    agentsMd.includes("Mandatory for all shell commands") ||
    agentsMd.includes("RTK is mandatory") ||
    agentsMd.includes("The Tool routing table above is mandatory") ||
    agentsMd.includes("**Any shell command** | **`rtk <command>`**");
  const hasRtkPrefixEnforcement =
    rtkMd.includes("MUST be prefixed with `rtk`") ||
    rtkMd.includes("Always prefix shell commands with `rtk`");
  const hasToolRouting =
    agentsMd.includes("Graphify first") &&
    agentsMd.includes("Serena MCP") &&
    agentsMd.includes("Repomix");
  record(
    "agents-md-rtk-mandate",
    hasAgentsMandate && hasRtkPrefixEnforcement,
    hasAgentsMandate && hasRtkPrefixEnforcement
      ? "Found RTK mandatory policy in AGENTS.md & RTK.md"
      : "Missing RTK policy"
  );
  record(
    "agents-md-tool-routing",
    hasToolRouting,
    hasToolRouting ? "Tool routing table intact" : "Missing tool routing rules"
  );
} catch (e) {
  record("agents-md-rules", false, e.message);
}

// 4. Eval Scenarios Invariants Check
try {
  const scenariosRaw = await readFile(
    path.join(root, ".agents", "evals", "scenarios.json"),
    "utf8"
  );
  const scenarios = JSON.parse(scenariosRaw);
  const hasRtkScenario = scenarios.scenarios.some(
    (s) => s.id === "tooling-rtk-compliance"
  );
  record(
    "eval-scenarios-rtk",
    hasRtkScenario,
    hasRtkScenario
      ? "Scenario 'tooling-rtk-compliance' configured"
      : "Missing tooling-rtk-compliance scenario"
  );
} catch (e) {
  record("eval-scenarios-rtk", false, e.message);
}

console.log("===========================================");
const failures = checks.filter((c) => !c.pass);
if (failures.length > 0) {
  console.error(`AI Tooling Verification FAILED (${failures.length} failed)`);
  process.exit(1);
} else {
  console.log(`All ${checks.length} AI tooling checks PASSED!`);
  process.exit(0);
}
