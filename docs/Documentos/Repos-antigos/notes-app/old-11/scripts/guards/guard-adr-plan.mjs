#!/usr/bin/env node
/**
 * guard-adr-plan.mjs
 *
 * Verifies that modifications to ADRs have a corresponding active execution plan
 * or tracer-bullet tickets.
 *
 * Usage:
 *   node scripts/guards/guard-adr-plan.mjs                   # checks working tree / branch against base
 *   node scripts/guards/guard-adr-plan.mjs --staged          # checks git staged files (pre-commit / lint-staged)
 *   node scripts/guards/guard-adr-plan.mjs --allow-no-plan   # bypass check
 *   node scripts/guards/guard-adr-plan.mjs [file ...]        # checks specific file list
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  checkAdrPlanGuard,
  formatAdrPlanFindings,
} from "./guard-adr-plan-lib.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

function git(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" });
  } catch (error) {
    return error.stdout?.toString() ?? null;
  }
}

function getCommitMessage() {
  const msg = git(["log", "-1", "--pretty=%B"]);
  return typeof msg === "string" ? msg : "";
}

function hasCommitBypass(message) {
  return /\[(skip-plan|no-plan)\]/i.test(message);
}

function parseCliArgs(argv) {
  const args = [...argv];
  let allowNoPlan = process.env.ALLOW_NO_PLAN === "1";
  let staged = false;
  let base = "origin/main";
  const explicitFiles = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--allow-no-plan") {
      allowNoPlan = true;
    } else if (arg === "--staged") {
      staged = true;
    } else if (arg === "--base" && i + 1 < args.length) {
      base = args[++i];
    } else if (!arg.startsWith("-")) {
      explicitFiles.push(arg);
    }
  }

  return { allowNoPlan, staged, base, explicitFiles };
}

function getChangedFiles({ staged, base, explicitFiles }) {
  if (explicitFiles.length > 0) {
    return explicitFiles;
  }

  if (staged) {
    const out = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
    return (out ?? "").split(/\r?\n/).filter(Boolean);
  }

  let out = git(["status", "--porcelain"]);
  if (out) {
    const lines = out.split(/\r?\n/).filter(Boolean);
    const files = lines.map((l) => l.slice(3).trim()).filter(Boolean);
    if (files.length > 0) {
      return files;
    }
  }

  out = git(["diff", "--name-only", `${base}...HEAD`]);
  if (!out) {
    out = git(["diff", "--name-only", "HEAD~1...HEAD"]);
  }
  return (out ?? "").split(/\r?\n/).filter(Boolean);
}

function main() {
  const { allowNoPlan, staged, base, explicitFiles } = parseCliArgs(
    process.argv.slice(2)
  );

  const commitMsg = getCommitMessage();
  const bypassed = allowNoPlan || hasCommitBypass(commitMsg);

  const changedFiles = getChangedFiles({ staged, base, explicitFiles });
  const result = checkAdrPlanGuard(changedFiles, {
    root,
    allowNoPlan: bypassed,
  });

  const output = formatAdrPlanFindings(result);
  if (result.pass) {
    console.log(output);
    process.exit(0);
  } else {
    console.error(output);
    process.exit(1);
  }
}

main();
