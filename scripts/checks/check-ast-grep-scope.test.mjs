import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { findBadIgnores } from "./check-ast-grep-scope.mjs";

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
