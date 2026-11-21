#!/usr/bin/env node
/**
 * verify-conventions-index.mjs
 *
 * Keeps the CONVENTIONS.md Enforcement Index honest: every row names either
 * `review-only` or package.json scripts that exist and run inside `check:fast`,
 * and every rule declared by guard-conventions appears in the index.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONVENTION_RULES } from "../guards/guard-conventions-lib.mjs";
import { verifyIndex } from "./verify-conventions-index-lib.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

export function runVerify() {
  const markdown = readFileSync(path.join(root, "CONVENTIONS.md"), "utf8");
  const { scripts } = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8")
  );
  const result = verifyIndex({
    markdown,
    scripts,
    ruleIds: CONVENTION_RULES.map((rule) => rule.id),
  });
  if (result.errors.length === 0) {
    console.log(
      `[verify-conventions-index] ✓ ${result.enforced} rule(s) enforced by a gate, ${result.reviewOnly} review-only.`
    );
    return true;
  }
  console.error("[verify-conventions-index] ✗ Enforcement Index problems:\n");
  for (const error of result.errors) {
    console.error(`  • ${error}`);
  }
  return false;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  if (!runVerify()) {
    process.exit(1);
  }
}
