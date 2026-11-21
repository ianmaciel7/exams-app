import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuth } from "./use-auth";

describe("useAuth", () => {
  it("throws error when used outside AuthProvider", () => {
    // Suppress console.error in this expected error test
    const consoleError = console.error;
    console.error = () => {};

    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    console.error = consoleError;
  });
});
