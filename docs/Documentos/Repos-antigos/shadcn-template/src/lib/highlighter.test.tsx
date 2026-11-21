import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { highlightCode, loadHighlighter } from "./highlighter";

function markupOf(node: ReactNode) {
  return renderToStaticMarkup(<div>{node}</div>);
}

function textOf(node: ReactNode) {
  return markupOf(node).replace(/<[^>]*>/g, "");
}

describe("highlightCode", () => {
  it("returns null for a language that is not listed", async () => {
    expect(await loadHighlighter("klingon")).toBeNull();
    expect(await highlightCode("anything", "klingon")).toBeNull();
  });

  it("returns one node per line and preserves the source text", async () => {
    const lines = await highlightCode("const a = 1;\nlet b;", "typescript");

    expect(lines).toHaveLength(2);
    expect(lines?.map(textOf)).toEqual(["const a = 1;", "let b;"]);
  });

  it("resolves aliases and ignores the case of the language", async () => {
    for (const language of ["ts", "TS", "TypeScript"]) {
      const lines = await highlightCode("let x: number;", language);

      expect(lines?.map(textOf)).toEqual(["let x: number;"]);
    }
  });

  it("themes tokens for both light and dark mode", async () => {
    const lines = await highlightCode("const a = 1;", "ts");

    expect(markupOf(lines?.[0])).toContain("--shiki-light");
    expect(markupOf(lines?.[0])).toContain("--shiki-dark");
  });

  it("tokenizes ANSI text one line at a time", async () => {
    const lines = await highlightCode("first\nsecond", "ansi");

    expect(lines?.map(textOf)).toEqual(["first", "second"]);
  });

  it.each([
    "bash",
    "css",
    "diff",
    "html",
    "javascript",
    "json",
    "jsx",
    "markdown",
    "python",
    "sql",
    "tsx",
    "typescript",
    "yaml",
  ])("loads and highlights %s", async (language) => {
    const lines = await highlightCode("x", language);

    expect(lines?.map(textOf)).toEqual(["x"]);
  });

  it.each(["js", "md", "py", "sh", "shell", "shellscript", "ts", "yml", "zsh"])(
    "resolves the %s alias to a listed language",
    async (alias) => {
      const lines = await highlightCode("x", alias);

      expect(lines?.map(textOf)).toEqual(["x"]);
    },
  );

  it("uses a different color for light and dark mode", async () => {
    const lines = await highlightCode("const a = 1;", "ts");
    const markup = markupOf(lines?.[0]);
    const light = markup.match(/--shiki-light:\s*(#[0-9a-f]{6})/i)?.[1];
    const dark = markup.match(/--shiki-dark:\s*(#[0-9a-f]{6})/i)?.[1];

    expect(light).toBeDefined();
    expect(dark).toBeDefined();
    expect(light).not.toBe(dark);
  });
});
