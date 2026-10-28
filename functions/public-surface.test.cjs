const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { describe, it } = require("node:test");

const source = readFileSync(join(__dirname, "index.js"), "utf8");

describe("Cloud Functions public surface", () => {
  it("exposes callables and blocking triggers only", () => {
    // Callables verify the Firebase ID token; onRequest endpoints do not.
    assert.doesNotMatch(source, /\bonRequest\b/);
    assert.match(source, /exports\.setUserRole = onCall\(/);
  });
});
