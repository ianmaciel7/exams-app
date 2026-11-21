#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  baselineRegressions,
  deletedTestFiles,
  parsePatch,
} from "./floor-guard-lib.mjs";

const baseFlag = process.argv.indexOf("--base");
const base = baseFlag >= 0 ? process.argv[baseFlag + 1] : "origin/main";

function git(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" });
  } catch (error) {
    return error.stdout?.toString() ?? null;
  }
}

function gitShow(ref, path) {
  try {
    return execFileSync("git", ["show", `${ref}:${path}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

const mergeBase = git(["merge-base", base, "HEAD"])?.trim();
if (!mergeBase) {
  console.error(`floor-guard: no merge base against ${base}`);
  process.exit(2);
}

const tracked = git(["diff", "--unified=0", mergeBase, "--"]) ?? "";
const nullDevice = process.platform === "win32" ? "NUL" : "/dev/null";
const untracked = (git(["ls-files", "--others", "--exclude-standard"]) ?? "")
  .split("\n")
  .filter(Boolean)
  .map(
    (file) => git(["diff", "--no-index", "--unified=0", nullDevice, file]) ?? ""
  )
  .join("\n");
const { added, removed } = parsePatch(`${tracked}\n${untracked}`);

const findings = [];
const remediation = {
  "silenced-checker":
    "Fix the underlying checker finding; do not add a suppression. See CONSTRAINTS.md.",
  "unfinished-work":
    "Complete the implementation or remove the unfinished production code.",
  "test-made-easier":
    "Restore the test strength and fix the behavior instead of skipping it.",
  "assertion-removed":
    "Restore the assertion or replace it with equivalent/stronger observable validation.",
  "test-file-deleted":
    "Restore the test file or explicitly replace its coverage in the same scoped change.",
  "new-exception":
    "Exceptions require an owner, reason, and expiry; review CONSTRAINTS.md.",
  "quality-floor-lowered":
    "Restore or tighten the prior quality floor; loosening requires explicit human intent.",
};
const flag = (rule, entry) => findings.push({ rule, ...entry });
const codeFile = /\.(cjs|cts|js|jsx|mjs|mts|ts|tsx)$/i;
const projectCodeFile = (file) =>
  codeFile.test(file) &&
  !file.startsWith(".agents/") &&
  file !== "scripts/guards/floor-guard.mjs";
const suppressions =
  /@ts-ignore|@ts-nocheck|eslint-disable|biome-ignore|#\s*noqa|#\s*type:\s*ignore|istanbul ignore|nosemgrep|gitleaks:allow|Stryker disable/;
const stubs =
  /throw new (Error|NotImplemented).*not implemented|catch\s*(?:\([^)]*\))?\s*\{\s*\}|\bTODO\b/;
const skips =
  /\.(skip|todo)\b|\bxit\(|\bxdescribe\(|@pytest\.mark\.skip|t\.Skip\(/;

for (const entry of added) {
  if (projectCodeFile(entry.file) && suppressions.test(entry.text)) {
    flag("silenced-checker", entry);
  }
  if (projectCodeFile(entry.file) && stubs.test(entry.text)) {
    flag("unfinished-work", entry);
  }
  if (projectCodeFile(entry.file) && skips.test(entry.text)) {
    flag("test-made-easier", entry);
  }
  if (
    /CONSTRAINTS\.md$/.test(entry.file) &&
    /^\|\s*(W|E)\d+\s*\|/.test(entry.text)
  ) {
    flag("new-exception", entry);
  }
}
for (const entry of removed) {
  if (
    /\.(test|spec)\.|_test\.|test_/.test(entry.file) &&
    /\b(expect|assert|should)\b/.test(entry.text)
  ) {
    flag("assertion-removed", entry);
  }
}
for (const file of deletedTestFiles(
  git(["diff", "--name-status", mergeBase, "--"]) ?? ""
)) {
  flag("test-file-deleted", { file, text: "test file deleted" });
}

for (const path of [
  "vitest.config.ts",
  ".jscpd.json",
  "lighthouserc.cjs",
  ".dependency-cruiser.cjs",
]) {
  const current = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (current === null) {
    continue;
  }
  for (const detail of baselineRegressions(path, current, gitShow, [
    mergeBase,
    "HEAD",
  ])) {
    flag("quality-floor-lowered", { file: path, text: detail });
  }
}

if (!findings.length) {
  console.log("floor-guard: clean");
  process.exit(0);
}
console.error(`floor-guard: ${findings.length} violation(s):`);
for (const finding of findings) {
  console.error(
    `  [${finding.rule}] ${finding.file}: ${finding.text.trim().slice(0, 120)}`
  );
  console.error(`    remediation: ${remediation[finding.rule]}`);
}
process.exit(1);
