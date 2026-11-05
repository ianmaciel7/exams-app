import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProtectedGuard, ProtectedGuardError } from "./protected-guard";

describe("ProtectedGuard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a semantic main container with children", () => {
    render(
      <ProtectedGuard>
        <p>{"Protected Content"}</p>
      </ProtectedGuard>,
    );
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });

  it("renders ProtectedGuardError with message and invokes retry on click", () => {
    const onRetry = vi.fn();
    render(
      <ProtectedGuardError
        message="Session expired"
        onRetry={onRetry}
        retryLabel="Try Again"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Session expired");
    const retryButton = screen.getByRole("button", { name: "Try Again" });
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
