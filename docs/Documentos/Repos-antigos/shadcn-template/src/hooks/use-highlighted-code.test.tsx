import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadHighlighter } = vi.hoisted(() => ({ loadHighlighter: vi.fn() }));

vi.mock("@/lib/highlighter", () => ({ loadHighlighter }));

import { useHighlightedCode } from "./use-highlighted-code";

type FakeState = { lines: number };

// A stand-in for the Shiki highlighter: it wraps every line in angle brackets
// and counts the lines it has seen, so tests can observe how the hook resumes
// from the previous grammar state while code streams in.
function createFakeHighlighter(wrap: [string, string] = ["<", ">"]) {
  const highlight = vi.fn((code: string, state?: FakeState) => {
    const lines: ReactNode[] = code
      .split("\n")
      .map((line) => `${wrap[0]}${line}${wrap[1]}`);

    return {
      lines,
      state: { lines: (state?.lines ?? 0) + lines.length } satisfies FakeState,
    };
  });

  return { highlight };
}

beforeEach(() => {
  loadHighlighter.mockReset();
});

describe("useHighlightedCode", () => {
  it("returns the plain lines for a language that is not supported", async () => {
    loadHighlighter.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useHighlightedCode("first\nsecond\n", "klingon"),
    );

    await waitFor(() =>
      expect(loadHighlighter).toHaveBeenCalledWith("klingon"),
    );
    expect(result.current).toEqual(["first", "second"]);
  });

  it("shows plain lines until the highlighter loads, then highlights them", async () => {
    loadHighlighter.mockResolvedValue(createFakeHighlighter());

    const { result } = renderHook(() => useHighlightedCode("a\nb", "ts"));

    expect(result.current).toEqual(["a", "b"]);
    await waitFor(() => expect(result.current).toEqual(["<a>", "<b>"]));
  });

  it("drops the trailing newline instead of rendering an empty last line", async () => {
    loadHighlighter.mockResolvedValue(createFakeHighlighter());

    const { result } = renderHook(() => useHighlightedCode("a\nb\n", "ts"));

    await waitFor(() => expect(result.current).toEqual(["<a>", "<b>"]));
  });

  it("tokenizes only the new lines while the code streams in", async () => {
    const fake = createFakeHighlighter();
    loadHighlighter.mockResolvedValue(fake);

    const { result, rerender } = renderHook(
      ({ value }) => useHighlightedCode(value, "ts"),
      { initialProps: { value: "a\nb" } },
    );

    await waitFor(() => expect(result.current).toEqual(["<a>", "<b>"]));

    rerender({ value: "a\nb\nc" });

    await waitFor(() => expect(result.current).toEqual(["<a>", "<b>", "<c>"]));

    // "a" is a finished line, so it is tokenized once and never again.
    const tokenizedA = fake.highlight.mock.calls.filter(
      ([code]) => code === "a",
    );
    expect(tokenizedA).toHaveLength(1);

    // "b" became a finished line and resumed from the state after "a".
    expect(fake.highlight).toHaveBeenCalledWith("b", { lines: 1 });
  });

  it("starts over when the code is replaced rather than extended", async () => {
    loadHighlighter.mockResolvedValue(createFakeHighlighter());

    const { result, rerender } = renderHook(
      ({ value }) => useHighlightedCode(value, "ts"),
      { initialProps: { value: "a\nb" } },
    );

    await waitFor(() => expect(result.current).toEqual(["<a>", "<b>"]));

    rerender({ value: "x\ny" });

    await waitFor(() => expect(result.current).toEqual(["<x>", "<y>"]));
  });

  it("falls back to plain lines while a different language loads", async () => {
    let finishPython: (value: unknown) => void = () => {};

    loadHighlighter.mockImplementation((language: string) =>
      language === "ts"
        ? Promise.resolve(createFakeHighlighter())
        : new Promise((resolve) => {
            finishPython = resolve;
          }),
    );

    const { result, rerender } = renderHook(
      ({ language }) => useHighlightedCode("a\nb", language),
      { initialProps: { language: "ts" } },
    );

    await waitFor(() => expect(result.current).toEqual(["<a>", "<b>"]));

    rerender({ language: "py" });

    expect(result.current).toEqual(["a", "b"]);

    finishPython(createFakeHighlighter());

    await waitFor(() => expect(result.current).toEqual(["<a>", "<b>"]));
  });

  it("uses the new highlighter when the language changes for the same code", async () => {
    loadHighlighter.mockImplementation((language: string) =>
      Promise.resolve(
        createFakeHighlighter(language === "ts" ? ["<", ">"] : ["[", "]"]),
      ),
    );

    const { result, rerender } = renderHook(
      ({ language }) => useHighlightedCode("a\nb", language),
      { initialProps: { language: "ts" } },
    );

    await waitFor(() => expect(result.current).toEqual(["<a>", "<b>"]));

    rerender({ language: "py" });

    await waitFor(() => expect(result.current).toEqual(["[a]", "[b]"]));
  });

  it("ignores a stale highlighter that finishes loading after the language changed", async () => {
    let finishTypescript: (value: unknown) => void = () => {};

    loadHighlighter.mockImplementation((language: string) =>
      language === "ts"
        ? new Promise((resolve) => {
            finishTypescript = resolve;
          })
        : Promise.resolve(createFakeHighlighter(["[", "]"])),
    );

    const { result, rerender } = renderHook(
      ({ language }) => useHighlightedCode("a\nb", language),
      { initialProps: { language: "ts" } },
    );

    rerender({ language: "py" });

    await waitFor(() => expect(result.current).toEqual(["[a]", "[b]"]));

    finishTypescript(createFakeHighlighter(["<", ">"]));
    await Promise.resolve();

    expect(result.current).toEqual(["[a]", "[b]"]);
  });
});
