import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "./forgot-password/page";
import RegisterPage from "./register/page";
import SignInPage from "./sign-in/page";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/components/firebase/google-sign-in-button", () => ({
  GoogleSignInButton: () => null,
}));
vi.mock("@/components/firebase/sign-in-auth-screen", () => ({
  SignInAuthScreen: (props: {
    onSignUpClick: () => void;
    onForgotPasswordClick: () => void;
  }) => (
    <>
      <button type="button" onClick={props.onSignUpClick}>
        {"register"}
      </button>
      <button type="button" onClick={props.onForgotPasswordClick}>
        {"reset"}
      </button>
    </>
  ),
}));
vi.mock("@/components/firebase/sign-up-auth-screen", () => ({
  SignUpAuthScreen: (props: { onSignInClick: () => void }) => (
    <button type="button" onClick={props.onSignInClick}>
      {"sign in"}
    </button>
  ),
}));
vi.mock("@/components/firebase/forgot-password-auth-screen", () => ({
  ForgotPasswordAuthScreen: (props: { onBackToSignInClick: () => void }) => (
    <button type="button" onClick={props.onBackToSignInClick}>
      {"back"}
    </button>
  ),
}));

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  cleanup();
  push.mockClear();
  window.history.replaceState(null, "", "/");
});
describe("authentication routes", () => {
  it.each([SignInPage, RegisterPage, ForgotPasswordPage])(
    "renders %s without browser globals",
    (Page) => {
      vi.stubGlobal("window", undefined);
      try {
        expect(renderToString(<Page />)).toContain("button");
      } finally {
        vi.unstubAllGlobals();
      }
    },
  );
  it("navigates from sign in to registration and recovery", () => {
    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: "register" }));
    fireEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(push.mock.calls).toEqual([["/register"], ["/forgot-password"]]);
  });
  it("navigates from registration back to sign in", () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: "sign in" }));
    expect(push).toHaveBeenCalledWith("/sign-in");
  });
  it("navigates from recovery back to sign in", () => {
    render(<ForgotPasswordPage />);
    fireEvent.click(screen.getByRole("button", { name: "back" }));
    expect(push).toHaveBeenCalledWith("/sign-in");
  });

  it("preserves the requested destination throughout registration and recovery", () => {
    const next = `?next=${encodeURIComponent("/profile?tab=security")}`;
    window.history.replaceState(null, "", `/sign-in${next}`);
    const { unmount } = render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: "register" }));
    fireEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(push.mock.calls).toEqual([
      [`/register${next}`],
      [`/forgot-password${next}`],
    ]);
    unmount();

    window.history.replaceState(null, "", `/register${next}`);
    const registration = render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: "sign in" }));
    expect(push).toHaveBeenLastCalledWith(`/sign-in${next}`);
    registration.unmount();

    window.history.replaceState(null, "", `/forgot-password${next}`);
    render(<ForgotPasswordPage />);
    fireEvent.click(screen.getByRole("button", { name: "back" }));
    expect(push).toHaveBeenLastCalledWith(`/sign-in${next}`);
  });

  it("drops unsafe return destinations from authentication navigation", () => {
    window.history.replaceState(
      null,
      "",
      `/sign-in?next=${encodeURIComponent("https://evil.example")}`,
    );
    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: "register" }));
    expect(push).toHaveBeenCalledWith("/register");
  });
});
