import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { findEmojiViolationsInContent } from "./guard-no-emojis.mjs";

test("findEmojiViolationsInContent detects emojis in code snippets", () => {
  const contentWithEmoji = `
const defaultIcon = "📁";
export function Space() {}
`;
  const violations = findEmojiViolationsInContent(
    contentWithEmoji,
    "test-file.ts"
  );
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 2);
  assert.equal(violations[0].match, "📁");
});

test("findEmojiViolationsInContent allows clean code without emojis", () => {
  const cleanContent = `
import { Folder } from "lucide-react";
const defaultIcon = "folder";
export function Space() { return <Folder />; }
`;
  const violations = findEmojiViolationsInContent(
    cleanContent,
    "clean-file.tsx"
  );
  assert.equal(violations.length, 0);
});

test("guard-no-emojis script passes on current src/ directory", () => {
  const output = execFileSync("node", ["scripts/guards/guard-no-emojis.mjs"], {
    encoding: "utf8",
  });
  assert.match(
    output,
    /Zero emojis found in project source outside src\/components\/ui\//
  );
});
