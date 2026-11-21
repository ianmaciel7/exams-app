import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCapturedErrorsForTest } from "@/lib/error-capture/capture";
import GlobalError from "./global-error";

describe("Global Error Boundary (src/app/global-error.tsx)", () => {
  beforeEach(() => {
    resetCapturedErrorsForTest();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the fallback UI, reports the error, and handles retry", () => {
    const reset = vi.fn();

    render(<GlobalError error={new Error("root crash")} reset={reset} />, {
      container: document.documentElement,
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      "[error-capture:global-error]",
      expect.objectContaining({ message: "root crash" })
    );

    fireEvent.click(screen.getByTestId("global-error-retry-btn"));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
