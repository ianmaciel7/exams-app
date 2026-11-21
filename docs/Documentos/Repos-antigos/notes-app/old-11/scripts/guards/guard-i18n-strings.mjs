#!/usr/bin/env node
/**
 * guard-i18n-strings.mjs
 *
 * Enforces internationalization (i18n) hygiene in UI components:
 * - Forbids hardcoded button text, headings, and alert text in JSX
 *   (e.g., "Retry Connection", "Sign in", "Submit") without using i18n translation functions
 *   such as t(...) or getTranslation(ui, ...).
 * - Forbids hardcoded known action phrases in JSX string children and props.
 *
 * Grounded in CONVENTIONS.md: "Internationalization (i18n) & Localized Strings".
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listApplicationComponentDirs } from "./component-scope-lib.mjs";
import { inspectI18nSource } from "./guard-i18n-strings-lib.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const configuredScanRoots = [
  path.join(root, "src/app"),
  path.join(root, "src/components/firebase"),
  ...listApplicationComponentDirs(root),
];
const scanRoots = configuredScanRoots.filter((scanRoot) =>
  existsSync(scanRoot)
);

// Known user-facing action/status phrases that must never be hardcoded
export const FORBIDDEN_PHRASES = [
  /retry\s+connection/i,
  /retry\s+request/i,
  /try\s+again/i,
  /sign\s+in\s+to\s+access/i,
  /failed\s+to\s+connect/i,
  /connection\s+lost/i,
  /reload\s+page/i,
];

const TRANSLATED_ATTRIBUTES = new Set([
  "alt",
  "aria-label",
  "placeholder",
  "title",
]);

/**
 * Checks if a JSX text node contains suspicious hardcoded natural language text.
 * Ignores empty whitespace, symbols, punctuation, or single character delimiters.
 */
/**
 * Analyze a TypeScript AST SourceFile for hardcoded strings and forbidden phrases.
 */
export function findI18nViolationsInSource(sourceText, filePath) {
  return inspectI18nSource(
    sourceText,
    filePath,
    FORBIDDEN_PHRASES,
    TRANSLATED_ATTRIBUTES
  );
}

export function scanDirectoryForI18nViolations(dir, baseDir = dir) {
  let violations = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      violations = violations.concat(
        scanDirectoryForI18nViolations(fullPath, baseDir)
      );
    } else if (/\.(tsx)$/.test(entry) && !entry.endsWith(".test.tsx")) {
      const relPath = path.relative(baseDir, fullPath).replaceAll("\\", "/");
      const content = readFileSync(fullPath, "utf8");
      violations = violations.concat(
        findI18nViolationsInSource(content, relPath)
      );
    }
  }
  return violations;
}

export function runGuard() {
  const violations = scanRoots.flatMap((scanRoot) =>
    scanDirectoryForI18nViolations(scanRoot, root)
  );
  if (violations.length === 0) {
    console.log(
      "[guard-i18n-strings] ✓ Zero hardcoded i18n violations found in application UI."
    );
    return true;
  }

  console.error(
    `[guard-i18n-strings] ✗ ${violations.length} i18n violation(s) found:\n`
  );
  for (const v of violations) {
    console.error(`  • ${v.file}:${v.line} - "${v.snippet}": ${v.reason}`);
  }
  console.error(`
Policy Violation:
  CONVENTIONS.md strictly forbids hardcoding user-facing strings (such as
  "Retry Connection", headings, error messages, or button text) in UI components.
  All user-facing copy must be localized via i18n dictionaries and translation keys.
`);
  return false;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const ok = runGuard();
  if (!ok) {
    process.exit(1);
  }
}
