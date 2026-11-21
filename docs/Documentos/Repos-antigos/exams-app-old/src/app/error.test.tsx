import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./error";

describe("ErrorBoundary", () => {
  it("hides internal error details and provides a recovery action", () => {
    const reset = vi.fn();

    render(
      <ErrorBoundary error={new Error("internal-secret")} reset={reset} />,
    );

    expect(screen.queryByText("internal-secret")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "An unexpected error occurred",
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
