#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const serverRouteFiles = ["src/app/layout.tsx", "src/app/page.tsx"];
const violations = [];

for (const relPath of serverRouteFiles) {
  const fullPath = path.join(root, relPath);
  if (!existsSync(fullPath)) {
    continue;
  }

  const content = readFileSync(fullPath, "utf8");
  if (/^(\s*['"]use client['"];?)/m.test(content)) {
    violations.push({
      file: relPath,
      message:
        "Top-level layout/page must remain a React Server Component. Move client behavior to the smallest interactive leaf.",
    });
  }
}

if (violations.length > 0) {
  console.error(
    `\x1b[31mrsc-boundaries-guard: ${violations.length} violation(s) found:\x1b[0m`
  );
  for (const violation of violations) {
    console.error(`  \x1b[33m${violation.file}\x1b[0m: ${violation.message}`);
  }
  process.exit(1);
}

console.log(
  "rsc-boundaries-guard: top-level App Router server boundaries passed."
);
