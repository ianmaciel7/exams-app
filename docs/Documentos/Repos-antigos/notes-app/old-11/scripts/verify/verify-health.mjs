#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
// Some tools (Biome) emit colour codes regardless of NO_COLOR.
import { stripVTControlCharacters as stripAnsi } from "node:util";

const root = fileURLToPath(new URL("../../", import.meta.url));

const flags = new Set(process.argv.slice(2));
const asJson = flags.has("--json");
const failFast = flags.has("--fail-fast");
const STEP_TIMEOUT_MS = 15 * 60 * 1000;

const log = (...parts) => {
  if (!asJson) {
    console.log(...parts);
  }
};

log("=== Verifying Full Project Health & Quality (Context & Harness) ===\n");

const results = [];

function finish() {
  const total = results.length;
  const failed = results.filter((r) => !r.pass);
  const passed = total - failed.length;

  if (asJson) {
    console.log(JSON.stringify({ total, passed, results }, null, 2));
  } else {
    log("\n==================================================================");
    log("Summary:");
    log(`Passed: ${passed}/${total}`);
    if (failed.length > 0) {
      console.error("\nFailures detected:");
      for (const f of failed) {
        console.error(`- ${f.name}:\n${f.error}`);
      }
    } else {
      log("All Quality, Context & Harness checks PASSED successfully!");
    }
  }
  process.exit(failed.length > 0 ? 1 : 0);
}

function runStep(
  name,
  cmd,
  args,
  { allowFail = false, parseGain = false } = {}
) {
  const start = Date.now();
  const proc = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    // Windows resolves pnpm/rtk through .cmd shims, which need a shell.
    shell: process.platform === "win32",
    timeout: STEP_TIMEOUT_MS,
    // Plain output keeps failure tails readable in logs and --json reports.
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  const seconds = Number(((Date.now() - start) / 1000).toFixed(2));
  let metric = `${seconds}s`;
  if (parseGain && proc.stdout) {
    const savedMatch = proc.stdout.match(/Tokens saved:\s+([^\n]+)/);
    if (savedMatch) {
      metric = `${savedMatch[1].trim()} (${seconds}s)`;
    }
  }

  const pass = proc.status === 0;
  results.push({
    name,
    pass,
    seconds,
    metric,
    // The cause of a failure is at the end of the output, so keep the tail.
    error: pass
      ? null
      : stripAnsi(
          proc.error?.message ?? (proc.stderr || proc.stdout || "").trim()
        )
          .split("\n")
          .slice(-15)
          .join("\n"),
  });

  const failIcon = allowFail ? "⚠" : "✗";
  const icon = pass ? "✓" : failIcon;
  log(`${icon} [${name.padEnd(26)}] ${metric}`);
  if (!pass && failFast) {
    finish();
  }
}

// 1. Static Quality & Types
runStep("TypeScript Types", "pnpm", ["run", "check:types"]);
runStep("Biome Linter & Formatter", "pnpm", ["run", "check:lint"]);
runStep("Architectural Boundaries", "pnpm", ["run", "deps:check"]);
runStep("Code Duplication (jscpd)", "pnpm", ["run", "check:duplication"]);
runStep("Floor Guard Constraints", "pnpm", ["run", "check:floor"]);

// 2. Unit Tests & Coverage
runStep("Vitest Unit Tests", "pnpm", ["run", "test"]);
runStep("Test Coverage Floor", "pnpm", ["run", "test:coverage"]);
runStep("Guard & Hook Tests", "pnpm", ["run", "test:guards"]);

// 3. Context & Documentation Governance
runStep("Repository Docs", "pnpm", ["run", "verify:docs"]);
runStep("Agents Config Sync", "pnpm", ["run", "check:agents"]);

// 4. Harness & AI Tooling Verification
runStep("Harness Eval Framework", "pnpm", ["run", "test:harness"]);
runStep("AI Tooling & RTK Protocol", "pnpm", ["run", "test:ai-tooling"]);
runStep("RTK Token Savings (Gain)", "rtk", ["gain"], { parseGain: true });

finish();
