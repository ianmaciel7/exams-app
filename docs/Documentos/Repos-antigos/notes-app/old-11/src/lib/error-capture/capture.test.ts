import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureError,
  normalizeError,
  resetCapturedErrorsForTest,
} from "./capture";

describe("normalizeError", () => {
  it("extracts name, message, stack and digest from Error instances", () => {
    const error = Object.assign(new Error("boom"), { digest: "abc123" });

    const result = normalizeError(error);

    expect(result.name).toBe("Error");
    expect(result.message).toBe("boom");
    expect(result.stack).toContain("boom");
    expect(result.digest).toBe("abc123");
  });

  it("wraps thrown strings and plain objects", () => {
    expect(normalizeError("oops")).toEqual({
      name: "NonErrorThrown",
      message: "oops",
    });
    expect(normalizeError({ code: 7 }).message).toBe('{"code":7}');
  });

  it("survives values that cannot be serialized", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(normalizeError(circular).message).toBe("[object Object]");
  });
});

describe("captureError", () => {
  beforeEach(() => {
    resetCapturedErrorsForTest();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("logs a structured payload with source and context", () => {
    const captured = captureError(new Error("boom"), {
      source: "error-boundary",
      context: { path: "/x" },
    });

    expect(captured).toMatchObject({
      message: "boom",
      source: "error-boundary",
      context: { path: "/x" },
      timestamp: "2026-09-30T12:00:00.000Z",
    });
    expect(console.error).toHaveBeenCalledWith(
      "[error-capture:error-boundary]",
      captured
    );
  });

  it("drops the same error reported through another channel within the window", () => {
    expect(
      captureError(new Error("boom"), { source: "error-boundary" })
    ).not.toBeNull();
    expect(
      captureError(new Error("boom"), { source: "window-error" })
    ).toBeNull();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("reports the same error again once the window has passed", () => {
    captureError(new Error("boom"), { source: "window-error" });
    vi.advanceTimersByTime(1500);

    expect(
      captureError(new Error("boom"), { source: "window-error" })
    ).not.toBeNull();
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("keeps distinct errors separate", () => {
    captureError(new Error("a"), { source: "window-error" });
    captureError(new Error("b"), { source: "window-error" });

    expect(console.error).toHaveBeenCalledTimes(2);
  });
});
