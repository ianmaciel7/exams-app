import assert from "node:assert/strict";
import test from "node:test";
import {
  checkDocSync,
  formatFindings,
  isCodeFile,
  isDocFile,
  normalizePath,
} from "./guard-doc-sync-lib.mjs";

test("normalizePath cleans backslashes and relative prefixes", () => {
  assert.equal(normalizePath("src\\app\\page.tsx"), "src/app/page.tsx");
  assert.equal(normalizePath("./docs/adr/0015.md"), "docs/adr/0015.md");
  assert.equal(normalizePath(""), "");
});

test("isDocFile identifies repository documentation", () => {
  const validDocs = [
    "README.md",
    "CONVENTIONS.md",
    "DESIGN.md",
    "ARCHITECTURE.md",
    "TOOLING.md",
    "docs/adr/0015-adopt-sidebar-space-navigation.md",
    "docs/product-specs/index.md",
    "docs/exec-plans/active/plan.md",
    ".serena/memories/architecture/notes.md",
    ".agents/rules/documentation-sync.md",
    ".agents/skills/biome/SKILL.md",
  ];

  for (const doc of validDocs) {
    assert.equal(isDocFile(doc), true, `expected ${doc} to be doc file`);
  }
});

test("isDocFile rejects non-docs, fixtures, logs, and external packages", () => {
  const nonDocs = [
    "src/components/ui/button.tsx",
    "scripts/guards/floor-guard.mjs",
    "package.json",
    ".agents/evals/fixtures/base/README.md",
    ".agents/logs/run.md",
    "node_modules/package/README.md",
    ".next/server/pages.md",
  ];

  for (const nonDoc of nonDocs) {
    assert.equal(
      isDocFile(nonDoc),
      false,
      `expected ${nonDoc} NOT to be doc file`
    );
  }
});

test("isCodeFile identifies source files, scripts, and key config files", () => {
  const codeFiles = [
    "src/app/page.tsx",
    "src/components/notes-app/space-shell.tsx",
    "src/hooks/use-auth.ts",
    "scripts/guards/floor-guard.mjs",
    "scripts/hooks/hook-typecheck-on-stop.mjs",
    "package.json",
    "firestore.rules",
    "vitest.config.ts",
    "biome.json",
    "components.json",
  ];

  for (const file of codeFiles) {
    assert.equal(isCodeFile(file), true, `expected ${file} to be code file`);
  }
});

test("isCodeFile rejects docs, assets, lockfiles, and generated paths", () => {
  const nonCodeFiles = [
    "README.md",
    "CONVENTIONS.md",
    "docs/adr/0015.md",
    "public/logo.png",
    "src/app/favicon.ico",
    "pnpm-lock.yaml",
    "skills-lock.json",
    ".agents/generated/sync.state.json",
    "graphify-out/graph.json",
    ".next/build-manifest.json",
    ".husky/pre-commit",
  ];

  for (const file of nonCodeFiles) {
    assert.equal(
      isCodeFile(file),
      false,
      `expected ${file} NOT to be code file`
    );
  }
});

test("checkDocSync passes when no files or only doc files are changed", () => {
  assert.equal(checkDocSync([]).pass, true);
  assert.equal(checkDocSync(["README.md", "docs/adr/0001.md"]).pass, true);
  assert.equal(
    checkDocSync(["pnpm-lock.yaml", "src/app/favicon.ico"]).pass,
    true
  );
});

test("checkDocSync fails when code files are changed without documentation", () => {
  const files = [
    "src/components/notes-app/spaces-empty.tsx",
    "src/components/notes-app/space-shell.tsx",
  ];
  const result = checkDocSync(files);
  assert.equal(result.pass, false);
  assert.equal(result.reason, "missing-docs");
  assert.deepEqual(result.codeFiles, files);
});

test("checkDocSync passes when code files are changed along with documentation", () => {
  const files = ["src/components/notes-app/space-shell.tsx", "DESIGN.md"];
  const result = checkDocSync(files);
  assert.equal(result.pass, true);
  assert.equal(result.reason, "docs-updated");
  assert.deepEqual(result.codeFiles, [
    "src/components/notes-app/space-shell.tsx",
  ]);
  assert.deepEqual(result.docFiles, ["DESIGN.md"]);
});

test("checkDocSync passes when code changes are explicitly bypassed", () => {
  const files = ["src/lib/utils.ts"];
  const result = checkDocSync(files, { allowNoDoc: true });
  assert.equal(result.pass, true);
  assert.equal(result.reason, "bypassed");
});

test("formatFindings outputs remediation guide on failure", () => {
  const failure = checkDocSync(["src/components/ui/empty.tsx"]);
  const formatted = formatFindings(failure);
  assert.match(formatted, /Documentation out of sync/);
  assert.match(formatted, /src\/components\/ui\/empty\.tsx/);
  assert.match(formatted, /Remediation/);
  assert.match(formatted, /--allow-no-doc/);
});
