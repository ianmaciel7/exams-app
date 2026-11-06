import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { inspectPrinciples, parsePrinciples } from "./check-base-ui-principles.mjs";

const table = (rows) =>
  `<!-- base-ui-version: 1.9.0 -->\n| Principle | Guard |\n| --- | --- |\n${rows}\n`;

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "base-ui-principles-"));
  for (const file of files) {
    mkdirSync(join(root, file, ".."), { recursive: true });
    writeFileSync(join(root, file), "");
  }
  return root;
}

test("parses principle rows and keeps manual reasons whole", () => {
  const rows = parsePrinciples(
    table("| A | rule:a, rule:b |\n| B | manual:needs a human, always |"),
  );
  assert.deepEqual(rows[0].guards, ["rule:a", "rule:b"]);
  assert.deepEqual(rows[1].guards, ["manual:needs a human, always"]);
});

test("accepts a complete matrix", () => {
  const root = fixture([".ast-grep/rules/base-ui/a.yml"]);
  try {
    assert.deepEqual(
      inspectPrinciples({
        markdown: table("| A | rule:a |"),
        root,
        installedVersion: "1.9.0",
      }),
      [],
    );
  } finally {
    rmSync(root, { recursive: true });
  }
});

test("rejects a missing rule, an unlisted rule, an unknown guard and a version drift", () => {
  const root = fixture([".ast-grep/rules/base-ui/orphan.yml"]);
  try {
    const errors = inspectPrinciples({
      markdown: table("| A | rule:gone |\n| B | wish:x |\n| C | manual:short |"),
      root,
      installedVersion: "1.10.0",
    }).join("\n");
    assert.match(errors, /reviewed for @base-ui\/react 1\.9\.0 but 1\.10\.0/);
    assert.match(errors, /rule gone does not exist/);
    assert.match(errors, /unknown guard "wish:x"/);
    assert.match(errors, /manual guard needs a reason/);
    assert.match(errors, /rule orphan is not listed/);
  } finally {
    rmSync(root, { recursive: true });
  }
});
