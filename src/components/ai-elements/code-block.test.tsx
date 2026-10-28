import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CodeBlockCopyButton, highlightCode } from "./code-block";

afterEach(cleanup);

// Use the public highlighter and installed Shiki, checking reconstructed text
// rather than the cache implementation or token boundaries.
function tokenize(code: string) {
  return new Promise<string>((resolve) => {
    const read = (result: NonNullable<ReturnType<typeof highlightCode>>) => {
      resolve(result.tokens.map((line) => line.map((token) => token.content).join("")).join("\n"));
    };
    const cached = highlightCode(code, "javascript", read);
    if (cached) read(cached);
  });
}

function snippets(marker: string) {
  const prefix = `// ${marker} ${"prefix ".repeat(20)}\n`;
  const suffix = `\n// ${"suffix ".repeat(20)}`;
  return [`${prefix}const result = "first";${suffix}`, `${prefix}const result = "other";${suffix}`] as const;
}

describe("CodeBlock text identity", () => {
  it("keeps equal-length middle edits distinct after an earlier result is cached", async () => {
    const [first, other] = snippets("sequential");
    expect(first.length).toBe(other.length);
    expect(await tokenize(first)).toBe(first);
    expect(await tokenize(other)).toBe(other);
    expect(await tokenize(first)).toBe(first);
  });

  it("delivers each requested text to concurrent subscriptions with matching endpoints", async () => {
    const [first, other] = snippets("concurrent");
    expect(await Promise.all([tokenize(first), tokenize(other)])).toEqual([first, other]);
  });
});

describe("CodeBlock copy action naming", () => {
  it("provides a default accessible name for its decorative icon", () => {
    render(<CodeBlockCopyButton />);
    expect(screen.getByRole("button", { name: "Copy code" })).toBeTruthy();
  });

  it("preserves a localized accessible-name override", () => {
    render(<CodeBlockCopyButton aria-label="Copiar código" />);
    expect(screen.getByRole("button", { name: "Copiar código" })).toBeTruthy();
  });

  it("uses consumer text as the name when custom children are supplied", () => {
    render(<CodeBlockCopyButton>Copy sample</CodeBlockCopyButton>);
    expect(screen.getByRole("button", { name: "Copy sample" })).toBeTruthy();
  });
});
