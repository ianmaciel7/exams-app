import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkTestNames, inspectTestNames } from "./check-test-names.mjs";

const none = new Map();

describe("test file naming guard", () => {
  it("accepts a test named after its sibling source", () => {
    assert.deepEqual(
      inspectTestNames(["src/app/page.tsx", "src/app/page.test.tsx"], none),
      [],
    );
  });

  it("accepts variant suffixes such as .browser", () => {
    assert.deepEqual(
      inspectTestNames(
        ["src/ui/button.tsx", "src/ui/button.browser.test.tsx"],
        none,
      ),
      [],
    );
  });

  it("rejects the home-page.test.tsx regression", () => {
    const [message] = inspectTestNames(
      ["src/app/page.tsx", "src/app/home-page.test.tsx"],
      none,
    );
    assert.match(message, /home-page\.test\.tsx.*"home-page\.\*"/);
  });

  it("does not take a source from another directory or another test", () => {
    assert.equal(
      inspectTestNames(
        ["src/a/page.tsx", "src/b/page.test.tsx", "src/b/x.test.ts"],
        none,
      ).length,
      2,
    );
  });

  it("allows listed exceptions and flags stale ones", () => {
    const allowed = new Map([["src/a/routes.test.tsx", "why"]]);
    assert.deepEqual(inspectTestNames(["src/a/routes.test.tsx"], allowed), []);
    assert.match(inspectTestNames([], allowed).join(" "), /stale/);
  });

  it("passes on this repository", () => {
    assert.deepEqual(
      checkTestNames(new URL("../../", import.meta.url).pathname),
      [],
    );
  });
});
