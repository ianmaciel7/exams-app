import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordFormClient } from "./forgot-password/_components/forgot-password-form-client";
import { RegisterFormClient } from "./register/_components/register-form-client";
import { SignInFormClient } from "./sign-in/_components/sign-in-form-client";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/components/firebase/google-sign-in-button", () => ({
  GoogleSignInButton: () => null,
}));
vi.mock("@/components/firebase/policies", () => ({ Policies: () => null }));
vi.mock("@/components/firebase/multi-factor-auth-assertion-form", () => ({
  MultiFactorAuthAssertionForm: () => null,
}));
vi.mock("@firebase-oss/ui-react", () => ({
  useUI: () => ({ state: "idle" }),
  useSignInAuthFormSchema: () => ({}),
  useSignUpAuthFormSchema: () => ({}),
  useForgotPasswordAuthFormSchema: () => ({}),
  useRequireDisplayName: () => false,
}));
vi.mock("@firebase-oss/ui-core", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  cleanup();
  push.mockClear();
  window.history.replaceState(null, "", "/");
});

const click = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

describe("authentication routes", () => {
  it.each([SignInFormClient, RegisterFormClient, ForgotPasswordFormClient])(
    "renders %s without browser globals",
    (Form) => {
      vi.stubGlobal("window", undefined);
      try {
        expect(renderToString(<Form />)).toContain("button");
      } finally {
        vi.unstubAllGlobals();
      }
    },
  );

  it("navigates from sign in to registration and recovery", () => {
    render(<SignInFormClient />);
    click("registerTitle");
    click("forgotPasswordPrompt");
    expect(push.mock.calls).toEqual([["/register"], ["/forgot-password"]]);
  });

  it("navigates from registration back to sign in", () => {
    render(<RegisterFormClient />);
    click("signInTitle");
    expect(push).toHaveBeenCalledWith("/sign-in");
  });

  it("navigates from recovery back to sign in", () => {
    render(<ForgotPasswordFormClient />);
    click("backToSignIn");
    expect(push).toHaveBeenCalledWith("/sign-in");
  });

  it("preserves the requested destination throughout registration and recovery", () => {
    const next = `?next=${encodeURIComponent("/profile?tab=security")}`;
    window.history.replaceState(null, "", `/sign-in${next}`);
    const { unmount } = render(<SignInFormClient />);
    click("registerTitle");
    click("forgotPasswordPrompt");
    expect(push.mock.calls).toEqual([
      [`/register${next}`],
      [`/forgot-password${next}`],
    ]);
    unmount();

    window.history.replaceState(null, "", `/register${next}`);
    const registration = render(<RegisterFormClient />);
    click("signInTitle");
    expect(push).toHaveBeenLastCalledWith(`/sign-in${next}`);
    registration.unmount();

    window.history.replaceState(null, "", `/forgot-password${next}`);
    render(<ForgotPasswordFormClient />);
    click("backToSignIn");
    expect(push).toHaveBeenLastCalledWith(`/sign-in${next}`);
  });

  it("drops unsafe return destinations from authentication navigation", () => {
    window.history.replaceState(
      null,
      "",
      `/sign-in?next=${encodeURIComponent("https://evil.example")}`,
    );
    render(<SignInFormClient />);
    click("registerTitle");
    expect(push).toHaveBeenCalledWith("/register");
  });
});
