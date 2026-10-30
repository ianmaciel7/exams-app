import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  callback: vi.fn(),
  error: null as string | null,
  state: "idle",
}));

vi.mock("@firebase-oss/ui-react", () => ({
  useUI: () => ({ state: mocks.state }),
  useSignInWithProvider: () => ({
    callback: mocks.callback,
    error: mocks.error,
  }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: (props: React.ComponentProps<"button">) => <button {...props} />,
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <span>{"spinner"}</span>,
}));

import { OAuthButton } from "./oauth-button";

describe("OAuthButton", () => {
  afterEach(() => {
    mocks.callback.mockReset();
    mocks.error = null;
    mocks.state = "idle";
  });

  it("communicates a pending provider operation and blocks duplicate attempts", () => {
    mocks.state = "pending";
    render(<OAuthButton provider={{ providerId: "google.com" } as never}>{"Google"}</OAuthButton>);

    const button = screen.getByRole("button", { name: /Google/ });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });

  it("keeps provider errors associated with the retryable control", () => {
    mocks.error = "The popup was blocked.";
    render(<OAuthButton provider={{ providerId: "google.com" } as never}>{"Google"}</OAuthButton>);

    const button = screen.getByRole("button", { name: "Google" });
    const alert = screen.getByRole("alert");
    expect(button.getAttribute("aria-describedby")).toBe(alert.id);
    fireEvent.click(button);
    expect(mocks.callback).toHaveBeenCalledOnce();
  });
});
