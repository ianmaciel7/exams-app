#!/usr/bin/env node
/**
 * verify-code.mjs
 *
 * Verifies code against CONSTRAINTS.md and CONVENTIONS.md. The gates come from
 * the documents themselves (the CONSTRAINTS "Enforced with numbers" table and
 * the CONVENTIONS Enforcement Index), so a gate added to either document is
 * picked up without touching this script.
 *
 *   --scope task|ci|all   which gates to run (default: task, the task-end set)
 *   --only a,b            run only these package.json scripts
 *   --list                print the plan without running anything
 *   --fail-fast           stop at the first failing gate
 *   --json                machine-readable output
 *
 * Exit codes: 0 all gates passed, 1 a gate failed, 2 the documents and
 * package.json disagree (nothing is run).
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, stripVTControlCharacters as stripAnsi } from "node:util";
import {
  buildPlan,
  formatPlan,
  formatReport,
  SCOPE_NAMES,
  stripPassthroughSeparator,
  tailOf,
} from "./verify-code-lib.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const CHECKLIST_PATH =
  ".agents/skills/verify-code/references/review-checklist.md";
const STEP_TIMEOUT_MS = 15 * 60 * 1000;

const read = (file) => readFileSync(path.join(root, file), "utf8");

function runGate(step) {
  const start = Date.now();
  const proc = spawnSync("pnpm", ["run", step.script], {
    cwd: root,
    encoding: "utf8",
    // Windows resolves pnpm through a .cmd shim, which needs a shell.
    shell: process.platform === "win32",
    timeout: STEP_TIMEOUT_MS,
    // A failing Biome run can print far more than spawnSync's 1 MB default,
    // which would replace the real findings with ENOBUFS.
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  const pass = proc.status === 0;
  return {
    script: step.script,
    dimensions:
      step.dimensions.length > 0 ? step.dimensions : ["Convention rules"],
    rules: step.rules,
    pass,
    seconds: Number(((Date.now() - start) / 1000).toFixed(1)),
    // The cause of a failure is at the end of the output, so keep the tail.
    error: pass
      ? null
      : tailOf(
          stripAnsi(proc.error?.message ?? (proc.stderr || proc.stdout || ""))
        ),
  };
}

function parseOptions(argv) {
  const { values } = parseArgs({
    args: stripPassthroughSeparator(argv),
    options: {
      scope: { type: "string", default: "task" },
      only: { type: "string", default: "" },
      list: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      "fail-fast": { type: "boolean", default: false },
    },
  });
  return {
    scope: values.scope,
    only: values.only.split(",").filter(Boolean),
    list: values.list,
    json: values.json,
    failFast: values["fail-fast"],
  };
}

function runGates(steps, { json, failFast }) {
  const results = [];
  for (const step of steps) {
    const result = runGate(step);
    results.push(result);
    if (!json) {
      console.log(
        `${result.pass ? "PASS" : "FAIL"}  ${step.script} (${result.seconds}s)`
      );
    }
    if (!result.pass && failFast) {
      break;
    }
  }
  return results;
}

export function runVerifyCode(argv) {
  const options = parseOptions(argv);
  const plan = buildPlan({
    constraints: read("CONSTRAINTS.md"),
    conventions: read("CONVENTIONS.md"),
    scripts: JSON.parse(read("package.json")).scripts,
    checklist: read(CHECKLIST_PATH),
    scope: options.scope,
    only: options.only,
  });

  if (plan.errors.length > 0) {
    console.error("[verify-code] documents and package.json disagree:\n");
    for (const error of plan.errors) {
      console.error(`  - ${error}`);
    }
    console.error(`\nScopes: ${SCOPE_NAMES.join(", ")}`);
    return 2;
  }
  if (options.list) {
    console.log(
      options.json ? JSON.stringify(plan, null, 2) : formatPlan(plan)
    );
    return 0;
  }

  const results = runGates(plan.steps, options);
  const pass = results.every((result) => result.pass);
  if (options.json) {
    console.log(JSON.stringify({ ...plan, results, pass }, null, 2));
  } else {
    console.log(
      `\n${formatReport({ plan, results, checklistPath: CHECKLIST_PATH })}`
    );
  }
  return pass ? 0 : 1;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  process.exit(runVerifyCode(process.argv.slice(2)));
}
