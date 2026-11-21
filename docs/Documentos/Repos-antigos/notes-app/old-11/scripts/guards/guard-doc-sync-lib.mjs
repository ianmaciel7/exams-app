/**
 * guard-doc-sync-lib.mjs
 *
 * Core logic for verifying that code or configuration changes are accompanied
 * by documentation updates (or explicit bypass).
 */

const DOC_EXTENSIONS = new Set([".md", ".mdx"]);

const EXCLUDED_PREFIXES = [
  ".agents/logs/",
  ".agents/evals/fixtures/",
  ".agents/generated/",
  "graphify-out/",
  ".next/",
  ".firebase/",
  "node_modules/",
  ".husky/",
];

const EXCLUDED_EXACT = new Set([
  "skills-lock.json",
  "pnpm-lock.yaml",
  "CLAUDE.md",
  ".mcp.json",
]);

const ASSET_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
  ".log",
]);

const ROOT_CONFIG_FILES = new Set([
  "firestore.rules",
  "package.json",
  "vitest.config.ts",
  "components.json",
  ".dependency-cruiser.cjs",
  ".jscpd.json",
  "biome.json",
  "tsconfig.json",
  "lighthouserc.cjs",
  "stryker.config.mjs",
  "osv-scanner.toml",
  "playwright.config.ts",
]);

export function normalizePath(filePath) {
  if (!filePath) {
    return "";
  }
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "").trim();
}

function hasAnyPrefix(file, prefixes) {
  return prefixes.some((prefix) => file.startsWith(prefix));
}

function getExtension(file) {
  const lastDot = file.lastIndexOf(".");
  if (lastDot === -1) {
    return "";
  }
  return file.slice(lastDot).toLowerCase();
}

export function isDocFile(filePath) {
  const file = normalizePath(filePath);
  if (!file) {
    return false;
  }

  if (
    hasAnyPrefix(file, [
      ".agents/logs/",
      ".agents/evals/fixtures/",
      "node_modules/",
      ".next/",
      ".firebase/",
    ])
  ) {
    return false;
  }

  const ext = getExtension(file);
  if (!DOC_EXTENSIONS.has(ext)) {
    return false;
  }

  // Root control documentation files
  if (!file.includes("/")) {
    return true;
  }

  // Documentation trees
  if (
    file.startsWith("docs/") ||
    file.startsWith(".serena/memories/") ||
    file.startsWith(".agents/rules/") ||
    file.startsWith(".agents/skills/") ||
    file.startsWith(".agents/agents/") ||
    file.startsWith(".agents/")
  ) {
    return true;
  }

  return true;
}

export function isCodeFile(filePath) {
  const file = normalizePath(filePath);
  if (!file) {
    return false;
  }

  // Doc files are handled separately and do not count as code files.
  if (isDocFile(file)) {
    return false;
  }

  if (hasAnyPrefix(file, EXCLUDED_PREFIXES)) {
    return false;
  }
  if (EXCLUDED_EXACT.has(file)) {
    return false;
  }

  const ext = getExtension(file);
  if (ASSET_EXTENSIONS.has(ext)) {
    return false;
  }

  // Application source code
  if (file.startsWith("src/")) {
    return true;
  }

  // Repository scripts and automation
  if (file.startsWith("scripts/")) {
    return true;
  }

  // Project configuration and schemas
  if (ROOT_CONFIG_FILES.has(file)) {
    return true;
  }

  return false;
}

export function checkDocSync(files = [], options = {}) {
  const normalized = files.map(normalizePath).filter(Boolean);
  const codeFiles = [...new Set(normalized.filter(isCodeFile))];
  const docFiles = [...new Set(normalized.filter(isDocFile))];

  if (codeFiles.length === 0) {
    return {
      pass: true,
      reason: "no-code-changes",
      codeFiles: [],
      docFiles,
      message:
        "No code or configuration changes requiring documentation update.",
    };
  }

  if (docFiles.length > 0) {
    return {
      pass: true,
      reason: "docs-updated",
      codeFiles,
      docFiles,
      message: `Documentation synchronized: ${docFiles.length} doc file(s) updated for ${codeFiles.length} changed code file(s).`,
    };
  }

  if (options.allowNoDoc) {
    return {
      pass: true,
      reason: "bypassed",
      codeFiles,
      docFiles: [],
      message: `Documentation sync explicitly bypassed for ${codeFiles.length} changed code file(s).`,
    };
  }

  return {
    pass: false,
    reason: "missing-docs",
    codeFiles,
    docFiles: [],
    message: `${codeFiles.length} code or configuration file(s) modified without updating documentation.`,
  };
}

export function formatFindings(result) {
  if (result.pass) {
    return `[guard-doc-sync] ✓ ${result.message}`;
  }

  const lines = [
    `[guard-doc-sync] ✗ Documentation out of sync!`,
    `${result.codeFiles.length} code/configuration file(s) were modified without updating documentation:`,
    ...result.codeFiles.map((file) => `  • ${file}`),
    "",
    "Remediation:",
    "  Update at least one relevant documentation file in the same change:",
    "    - Root control docs: CONVENTIONS.md, DESIGN.md, ARCHITECTURE.md, CONTEXT.md, etc.",
    "    - Architecture Decision Record: docs/adr/NNNN-<slug>.md",
    "    - Active execution plan: docs/exec-plans/active/<slug>.md",
    "    - Serena memory: .serena/memories/<topic>/<slug>.md",
    "    - Project agent rules or skills: .agents/rules/ or .agents/skills/",
    "",
    "  If this change genuinely requires no documentation update, you may bypass via:",
    "    CLI: pnpm run check:doc-sync -- --allow-no-doc",
    "    Commit: commit message containing '[skip-doc-sync]' or '[no-doc]'",
    "    Env: ALLOW_NO_DOC=1",
  ];

  return lines.join("\n");
}
