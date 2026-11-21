#!/usr/bin/env node
/**
 * guard-conventions.mjs
 *
 * Enforces the mechanically checkable rules of CONVENTIONS.md that no other
 * tool owns (Biome, TypeScript and the other guards own the rest). Rules are
 * declared in guard-conventions-lib.mjs and indexed in CONVENTIONS.md.
 *
 * Usage: node scripts/guards/guard-conventions.mjs [file ...]
 * Without arguments the whole of src/ is scanned.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isInScope,
  listSourceFiles,
  normalizeRelative,
  runChecks,
} from "./guard-conventions-lib.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

export function runGuard(args = []) {
  const files =
    args.length > 0
      ? args.map((file) => normalizeRelative(root, file)).filter(isInScope)
      : listSourceFiles(root);
  const violations = runChecks(root, files);
  if (violations.length === 0) {
    console.log(
      `[guard-conventions] ✓ ${files.length} file(s) comply with the mechanical CONVENTIONS.md rules.`
    );
    return true;
  }

  console.error(
    `[guard-conventions] ✗ ${violations.length} convention violation(s):\n`
  );
  for (const v of violations) {
    console.error(`  • ${v.file}:${v.line} [${v.rule}] ${v.message}`);
    if (v.snippet) {
      console.error(`      ${v.snippet}`);
    }
  }
  console.error(
    "\nRules are owned by CONVENTIONS.md (see its Enforcement Index). Fix the code; do not suppress."
  );
  return false;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  if (!runGuard(process.argv.slice(2))) {
    process.exit(1);
  }
}
