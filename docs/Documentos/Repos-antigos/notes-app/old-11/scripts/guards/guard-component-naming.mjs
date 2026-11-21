#!/usr/bin/env node
/**
 * guard-component-naming.mjs
 *
 * Enforces that every *.tsx file in an application folder of src/components/
 * (every folder except ui/ and firebase/, excluding test files) either:
 *   1. Ends with a recognised shadcn-style UI suffix, OR
 *   2. Is a Next.js special-cased reserved filename, OR
 *   3. Is an explicitly allowed React/project-specific pattern.
 *
 * Add new suffixes or allow-listed names to the constants below when the
 * project adopts them.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { listApplicationComponentFiles } from "./component-scope-lib.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

// ---------------------------------------------------------------------------
// Allowed application component role suffixes. The suffix describes the
// component's public role; it does not have to mirror the exact primitive used
// as its JSX root.
const SHADCN_SUFFIXES = new Set([
  "card",
  "form",
  "field",
  "button",
  "select",
  "alert",
  "menu",
  "provider",
  "switcher",
  "input",
  "badge",
  "dialog",
  "sheet",
  "table",
  "list",
  "item",
  "header",
  "footer",
  "group",
  "sidebar",
  "shell",
  "drawer",
  "popover",
  "tooltip",
  "tabs",
  "skeleton",
  "spinner",
  "avatar",
  "chart",
  "calendar",
  "checkbox",
  "radio",
  "toggle",
  "slider",
  "textarea",
  "separator",
  "label",
  "breadcrumb",
  "pagination",
  "accordion",
  "collapsible",
  "command",
  "combobox",
  "dropdown",
  "navigation",
  "progress",
  "scroll",
  "resizable",
  "sonner",
  "toast",
  "toaster",
  "carousel",
  "status",
  "loading",
  "empty",
  "description",
  "title",
  "content",
  "section",
  "figure",
  "overlay",
  "row",
  "cell",
  "trigger",
  "set",
]);

// ---------------------------------------------------------------------------
// Next.js reserved filenames (no suffix needed)
// ---------------------------------------------------------------------------
const NEXTJS_RESERVED = new Set([
  "page",
  "layout",
  "loading",
  "error",
  "not-found",
  "template",
  "default",
  "route",
  "middleware",
  "instrumentation",
]);

// ---------------------------------------------------------------------------
// React / project-specific allow-list (full basename without extension)
// These are special patterns that don't carry a shadcn suffix but are
// intentionally structured this way (guards, providers, context, etc.).
// ---------------------------------------------------------------------------
const ALLOWED_BASENAMES = new Set([
  "require-auth", // HOC / route guard pattern
  "require-guest", // HOC / route guard pattern
  "auth-provider", // React context provider
  "theme-provider", // React context provider
]);

// ---------------------------------------------------------------------------
// Core check
// ---------------------------------------------------------------------------

function getBasename(filename) {
  return path.basename(filename, ".tsx");
}

function getSuffix(basename) {
  const separatorIndex = basename.lastIndexOf("-");
  return separatorIndex === -1 ? basename : basename.slice(separatorIndex + 1);
}

function isCompliant(filename) {
  if (!filename.endsWith(".tsx")) {
    return true;
  }
  if (filename.endsWith(".test.tsx") || filename.endsWith(".spec.tsx")) {
    return true;
  }
  if (filename.endsWith(".stories.tsx")) {
    return true;
  }

  const basename = getBasename(filename);

  if (ALLOWED_BASENAMES.has(basename)) {
    return true;
  }
  if (NEXTJS_RESERVED.has(basename)) {
    return true;
  }

  return SHADCN_SUFFIXES.has(getSuffix(basename));
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const files = listApplicationComponentFiles(root).map((file) =>
  path.relative(path.join(root, "src/components"), file).replaceAll("\\", "/")
);

const violations = files.filter((f) => !isCompliant(path.posix.basename(f)));

if (violations.length === 0) {
  console.log(
    `[guard-component-naming] ✓ All ${files.filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx") && !f.endsWith(".stories.tsx")).length} application component files in src/components/ (outside ui/ and firebase/) have a valid shadcn-style suffix.`
  );
  process.exit(0);
} else {
  console.error(
    `[guard-component-naming] ✗ ${violations.length} file(s) violate the shadcn naming convention:\n`
  );
  for (const v of violations) {
    console.error(`  • ${v}`);
  }
  console.error(`
Each application component file in src/components/ (outside ui/ and firebase/) must end with a recognised
shadcn-style suffix (e.g. -card, -form, -button, -select, -alert, -menu,
-provider, -switcher, -header, etc.) or be listed in ALLOWED_BASENAMES in
scripts/guards/guard-component-naming.mjs.

Next.js reserved filenames (page.tsx, layout.tsx, …) are exempt.
`);
  process.exit(1);
}
