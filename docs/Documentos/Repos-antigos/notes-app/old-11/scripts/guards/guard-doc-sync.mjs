#!/usr/bin/env node
/**
 * guard-doc-sync.mjs
 *
 * Enforces that code or configuration modifications are accompanied by
 * documentation updates (or explicit bypass).
 *
 * Usage:
 *   node scripts/guards/guard-doc-sync.mjs                   # checks working tree / branch against base
 *   node scripts/guards/guard-doc-sync.mjs --staged          # checks git staged files (pre-commit / lint-staged)
 *   node scripts/guards/guard-doc-sync.mjs --allow-no-doc    # bypass documentation check
 *   node scripts/guards/guard-doc-sync.mjs [file ...]        # checks specific file list
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkDocSync,
  formatFindings,
  normalizePath,
} from "./guard-doc-sync-lib.mjs";

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
  return /\[(skip-doc-sync|no-doc)\]/i.test(message);
}

function parseCliArgs(argv) {
  const args = [...argv];
  let allowNoDoc = false;
  let staged = false;
  let base = "origin/main";
  const explicitFiles = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--allow-no-doc") {
      allowNoDoc = true;
    } else if (arg === "--staged") {
      staged = true;
    } else if (arg === "--base" && i + 1 < args.length) {
      base = args[++i];
    } else if (!arg.startsWith("-")) {
      explicitFiles.push(arg);
    }
  }

  return { allowNoDoc, staged, base, explicitFiles };
}

function addOutputFiles(fileSet, output) {
  if (!output) {
    return;
  }
  for (const f of output.split(/\r?\n/)) {
    if (f.trim()) {
      fileSet.add(normalizePath(f));
    }
  }
}

export function collectChangedFiles({ staged, base, explicitFiles }) {
  if (explicitFiles.length > 0) {
    return explicitFiles.map(normalizePath);
  }

  if (staged) {
    const output = git(["diff", "--cached", "--name-only"]) ?? "";
    return output.split(/\r?\n/).map(normalizePath).filter(Boolean);
  }

  // Branch and working tree comparison against merge-base
  const mergeBase = git(["merge-base", base, "HEAD"])?.trim();
  const fileSet = new Set();

  if (mergeBase) {
    addOutputFiles(fileSet, git(["diff", "--name-only", mergeBase, "HEAD"]));
  } else {
    // Fallback if merge-base against target base is unavailable
    addOutputFiles(fileSet, git(["diff", "--name-only", "HEAD~1"]));
  }

  // Include uncommitted and untracked changes
  addOutputFiles(fileSet, git(["diff", "--name-only", "HEAD"]));
  addOutputFiles(fileSet, git(["ls-files", "--others", "--exclude-standard"]));

  return [...fileSet];
}

export function runGuard(argv = process.argv.slice(2)) {
  const {
    allowNoDoc: cliAllowNoDoc,
    staged,
    base,
    explicitFiles,
  } = parseCliArgs(argv);

  const envBypass =
    process.env.ALLOW_NO_DOC === "1" ||
    process.env.ALLOW_NO_DOC === "true" ||
    process.env.SKIP_DOC_SYNC === "1" ||
    process.env.SKIP_DOC_SYNC === "true";

  const commitBypass = hasCommitBypass(getCommitMessage());
  const allowNoDoc = cliAllowNoDoc || envBypass || commitBypass;

  const files = collectChangedFiles({ staged, base, explicitFiles });
  const result = checkDocSync(files, { allowNoDoc });

  if (result.pass) {
    console.log(formatFindings(result));
    return true;
  }

  console.error(formatFindings(result));
  return false;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const passed = runGuard();
  process.exit(passed ? 0 : 1);
}
