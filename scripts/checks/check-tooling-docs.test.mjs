import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectToolingDocs } from "./check-tooling-docs.mjs";

function fixture({ scripts, tooling, rules = {} }) {
  const root = mkdtempSync(join(tmpdir(), "tooling-docs-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts }));
  writeFileSync(join(root, "TOOLING.md"), tooling);
  mkdirSync(join(root, ".ast-grep/rules/react"), { recursive: true });
  for (const [name, id] of Object.entries(rules)) {
    writeFileSync(
      join(root, `.ast-grep/rules/react/${name}.yml`),
      `id: ${id}\nlanguage: tsx\n`,
    );
  }
  return root;
}

test("accepts documented scripts, rules and workflows", (t) => {
  const root = fixture({
    scripts: { lint: "biome check", prepare: "husky" },
    tooling: "`pnpm lint` and `no-memo` in ci.yml",
    rules: { "no-memo-ts": "no-memo-ts", "no-memo-tsx": "no-memo-tsx" },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(inspectToolingDocs(root, ["ci.yml"]), []);
});

test("rejects an undocumented package script", (t) => {
  const root = fixture({
    scripts: { lint: "x", "check:new": "y" },
    tooling: "`pnpm lint`",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectToolingDocs(root)[0], /"check:new" is not documented/);
});

test("rejects an ast-grep rule missing from the registry", (t) => {
  const root = fixture({
    scripts: {},
    tooling: "nothing",
    rules: { "no-memo-tsx": "no-memo-tsx" },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(
    inspectToolingDocs(root)[0],
    /"no-memo-tsx" is not in the registry/,
  );
});

test("rejects an undocumented workflow", (t) => {
  const root = fixture({ scripts: {}, tooling: "ci.yml" });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(
    inspectToolingDocs(root, ["ci.yml", "cd.yml"])[0],
    /workflow cd.yml/,
  );
});
