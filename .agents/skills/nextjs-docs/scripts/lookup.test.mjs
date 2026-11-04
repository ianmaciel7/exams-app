import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = resolve(
  fileURLToPath(import.meta.url),
  "../lookup.mjs",
);

test("lookup script shows help when invoked without arguments", () => {
  const output = execFileSync("node", [scriptPath, "--help"], {
    encoding: "utf8",
  });
  assert.match(output, /Next\.js Installed Documentation & Server Internals Lookup/);
  assert.match(output, /Usage:/);
});

test("lookup script finds docs for 'use cache'", () => {
  const output = execFileSync("node", [scriptPath, "use cache"], {
    encoding: "utf8",
  });
  assert.match(output, /node_modules\/next\/dist\/docs/);
  assert.match(output, /use-cache\.md/);
});

test("lookup script with --server finds internal server lib files", () => {
  const output = execFileSync("node", [scriptPath, "--server", "route-cache"], {
    encoding: "utf8",
  });
  assert.match(output, /node_modules\/next\/dist\/server\/lib/);
  assert.match(output, /route-cache-key/);
});
