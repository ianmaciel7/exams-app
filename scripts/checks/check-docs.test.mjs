import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { inspectLinks, inspectSkillInventory } from "./check-docs.mjs";

function fixture(files, run) {
  const root = mkdtempSync(join(tmpdir(), "docs-check-"));
  try {
    for (const [file, source] of Object.entries(files)) {
      const path = join(root, file);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, source);
    }
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("accepts files, directories, local anchors, and duplicate headings", () => {
  fixture({ "guide.md": "# Guide\n## Topic\n## Topic\n" }, (root) => {
    assert.deepEqual(
      inspectLinks(
        root,
        "guide.md",
        "[local](#topic) [duplicate](#topic-1) [directory](.)",
      ),
      [],
    );
  });
});

test("rejects missing files and anchors with source locations", () => {
  fixture({ "guide.md": "# Guide\n" }, (root) => {
    const errors = inspectLinks(
      root,
      "guide.md",
      "[bad](gone.md)\n[bad](#gone)",
    );
    assert.equal(errors.length, 2);
    assert.match(errors[0], /guide.md:1 Missing link target/);
    assert.match(errors[1], /guide.md:2 Missing heading anchor/);
  });
});

test("accepts cross-file anchors and paths with spaces", () => {
  fixture({ "docs/my guide.md": "# My guide\n" }, (root) => {
    assert.deepEqual(
      inspectLinks(root, "README.md", "[guide](<docs/my guide.md#my-guide>)"),
      [],
    );
  });
});

test("ignores external URLs and examples in fenced or inline code", () => {
  fixture({}, (root) => {
    const source =
      "[web](https://example.com) [email](mailto:a@example.com)\n```md\n[x](gone.md)\n```\n`[x](gone.md)`";
    assert.deepEqual(inspectLinks(root, "README.md", source), []);
  });
});

test("maps only the exact historical ADR source and requires its replacement", () => {
  const old = "[source](../../src/components/ui/extensions/theme-provider.tsx)";
  fixture(
    { "src/components/ui/extensions/theme-provider-client.tsx": "" },
    (root) => {
      assert.deepEqual(
        inspectLinks(root, "docs/adr/0003-configure-theming.md", old),
        [],
      );
      assert.equal(inspectLinks(root, "docs/adr/other.md", old).length, 1);
    },
  );
  fixture({}, (root) => {
    assert.equal(
      inspectLinks(root, "docs/adr/0003-configure-theming.md", old).length,
      1,
    );
  });
});

test("matches the inventory to installed entrypoints", () => {
  const files = [
    ".agents/skills/first/SKILL.md",
    ".agents/skills/second/SKILL.md",
  ];
  assert.deepEqual(
    inspectSkillInventory(files, "| first | entry |\n| second | entry |"),
    [],
  );
  assert.deepEqual(
    inspectSkillInventory(files, "| first | entry |\n| stale | entry |"),
    [
      "Missing skill inventory entry: second",
      "Obsolete skill inventory entry: stale",
    ],
  );
});
