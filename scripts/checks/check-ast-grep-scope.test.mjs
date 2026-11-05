import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findBadIgnores } from "./check-ast-grep-scope.mjs";

test("rejects inline error-boundary props in real route paths", () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const dir = mkdtempSync(join(tmpdir(), "inline-props-"));
  const inline =
    "export default function Boundary(props: { error: Error; retry: () => void }) { return <div />; }";
  const files = [
    "src/app/error.tsx",
    "src/app/(protected)/profile/error.tsx",
    "src/app/global-error.tsx",
  ];
  try {
    for (const file of files) {
      mkdirSync(join(dir, file, ".."), { recursive: true });
      writeFileSync(join(dir, file), inline);
    }
    writeFileSync(
      join(dir, "sgconfig.yml"),
      `ruleDirs:\n  - ${join(root, ".ast-grep/rules")}\n`,
    );
    const scan = () =>
      spawnSync(
        join(root, "node_modules/.bin/ast-grep"),
        ["scan", "--filter", "no-inline-component-props", "--json=compact"],
        { cwd: dir, encoding: "utf8" },
      );
    const rejected = scan();
    assert.equal(rejected.status, 1, rejected.stderr);
    assert.equal(JSON.parse(rejected.stdout).length, files.length);
    for (const file of files) {
      writeFileSync(
        join(dir, file),
        "type BoundaryProps = { error: Error; retry: () => void }; " +
          inline.replace(
            "props: { error: Error; retry: () => void }",
            "props: BoundaryProps",
          ),
      );
    }
    const accepted = scan();
    assert.equal(accepted.status, 0, accepted.stderr);
    assert.deepEqual(JSON.parse(accepted.stdout), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("accepts the real rules", () => {
  assert.deepEqual(findBadIgnores(), []);
});

test("rejects an ignore that also hides ui/extensions", () => {
  const dir = mkdtempSync(join(tmpdir(), "rules-"));
  mkdirSync(join(dir, "x"));
  writeFileSync(
    join(dir, "x", "bad.yml"),
    "id: bad\nignores:\n  - src/components/ui/*.tsx\n",
  );
  writeFileSync(
    join(dir, "x", "good.yml"),
    'id: good\nignores:\n  - "src/components/ui/[!e]*.tsx"\n',
  );
  assert.deepEqual(findBadIgnores(dir), [join(dir, "x", "bad.yml")]);
});
