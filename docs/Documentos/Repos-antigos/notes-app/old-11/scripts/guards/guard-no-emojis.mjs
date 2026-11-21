#!/usr/bin/env node
/**
 * guard-no-emojis.mjs
 *
 * Enforces that no emoji literals are used anywhere in src/ (code, UI, icons, or default values).
 * Per DESIGN.md, CONVENTIONS.md, and .agents/rules/no-emojis.md, all icons must be SVG / Lucide
 * icons, and domain entities must use semantic string identifiers instead of emojis.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const srcDir = path.join(root, "src");

export const EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}]|\p{Extended_Pictographic}|\p{Emoji_Presentation}/u;

export function findEmojiViolationsInContent(content, relPath) {
  const violations = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (EMOJI_REGEX.test(line)) {
      const match = line.match(EMOJI_REGEX);
      violations.push({
        file: relPath,
        line: i + 1,
        match: match ? match[0] : "",
        snippet: line.trim(),
      });
    }
  }
  return violations;
}

export function scanDirectoryForEmojis(dir, baseDir = dir) {
  let violations = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      const relDir = path.relative(baseDir, fullPath).replaceAll("\\", "/");
      if (relDir === "components/ui" || relDir.startsWith("components/ui/")) {
        continue;
      }
      violations = violations.concat(scanDirectoryForEmojis(fullPath, baseDir));
    } else if (/\.(ts|tsx|js|mjs|jsx|css)$/.test(entry)) {
      const relPath = path.relative(baseDir, fullPath).replaceAll("\\", "/");
      const content = readFileSync(fullPath, "utf8");
      violations = violations.concat(
        findEmojiViolationsInContent(content, relPath)
      );
    }
  }
  return violations;
}

export function runGuard() {
  const violations = scanDirectoryForEmojis(srcDir);
  if (violations.length === 0) {
    console.log(
      "[guard-no-emojis] ✓ Zero emojis found in project source outside src/components/ui/."
    );
    return true;
  }

  console.error(
    `[guard-no-emojis] ✗ ${violations.length} emoji violation(s) found in src/:\n`
  );
  for (const v of violations) {
    console.error(
      `  • ${v.file}:${v.line} - contains emoji '${v.match}' in line: "${v.snippet}"`
    );
  }
  console.error(`
Policy Violation:
  CONVENTIONS.md and DESIGN.md forbid the use of emojis in source code,
  UI components, icon defaults, fallbacks, and domain entities.
  Use Lucide icons (lucide-react) or semantic identifiers instead.
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
