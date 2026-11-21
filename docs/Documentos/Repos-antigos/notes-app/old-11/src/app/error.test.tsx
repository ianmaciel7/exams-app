import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./error";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Something went wrong",
      description:
        "An unexpected error occurred while communicating with application services.",
      retry: "Try again",
      backToHome: "Back to Home",
    };
    return translations[key] || key;
  },
}));

describe("Root Error Boundary (src/app/error.tsx)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a generic message without leaking the raw error and handles retry", () => {
    const reset = vi.fn();
    const testError = new Error("Firebase connection timeout");

    render(<ErrorBoundary error={testError} reset={reset} />);

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.queryByText("Firebase connection timeout")).toBeNull();
    expect(
      screen.getByText(
        "An unexpected error occurred while communicating with application services."
      )
    ).toBeDefined();

    const retryBtn = screen.getByTestId("error-boundary-retry-btn");
    fireEvent.click(retryBtn);
    expect(reset).toHaveBeenCalledTimes(1);

    const homeBtn = screen.getByTestId("error-boundary-home-btn");
    expect(homeBtn).toBeDefined();
    expect(homeBtn.getAttribute("href")).toBe("/");
  });

  it("falls back to default description when error has no message", () => {
    const reset = vi.fn();
    const testError = new Error("");

    render(<ErrorBoundary error={testError} reset={reset} />);

    expect(
      screen.getByText(
        "An unexpected error occurred while communicating with application services."
      )
    ).toBeDefined();
  });
});
