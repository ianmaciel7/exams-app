import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordFormClient } from "./forgot-password/_components/forgot-password-form-client";
import { RegisterFormClient } from "./register/_components/register-form-client";
import { SignInFormClient } from "./sign-in/_components/sign-in-form-client";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/components/firebase/google-sign-in-button-client", () => ({
  GoogleSignInButtonClient: () => null,
}));
vi.mock("@/components/firebase/policies-section-client", () => ({
  PoliciesSectionClient: () => null,
}));
vi.mock("@/components/firebase/multi-factor-assertion-flow-client", () => ({
  MultiFactorAssertionFlowClient: () => null,
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

afterEach(cleanup);

const href = (name: string) =>
  screen.getByRole("link", { name }).getAttribute("href");

describe("authentication routes", () => {
  it.each([SignInFormClient, RegisterFormClient, ForgotPasswordFormClient])(
    "renders %s without browser globals",
    (Form) => {
      vi.stubGlobal("window", undefined);
      try {
        expect(renderToString(<Form />)).toContain("<a");
      } finally {
        vi.unstubAllGlobals();
      }
    },
  );

  it("links from sign in to registration and recovery", () => {
    render(<SignInFormClient />);
    expect(href("registerTitle")).toBe("/register");
    expect(href("forgotPasswordPrompt")).toBe("/forgot-password");
  });

  it("links from registration back to sign in", () => {
    render(<RegisterFormClient />);
    expect(href("signInTitle")).toBe("/sign-in");
  });

  it("links from recovery back to sign in", () => {
    render(<ForgotPasswordFormClient />);
    expect(href("backToSignIn")).toBe("/sign-in");
  });

  it("preserves the requested destination on every link", () => {
    const next = "/profile?tab=security";
    const query = `?next=${encodeURIComponent(next)}`;
    const { unmount } = render(<SignInFormClient next={next} />);
    expect(href("registerTitle")).toBe(`/register${query}`);
    expect(href("forgotPasswordPrompt")).toBe(`/forgot-password${query}`);
    unmount();
    const registration = render(<RegisterFormClient next={next} />);
    expect(href("signInTitle")).toBe(`/sign-in${query}`);
    registration.unmount();
    render(<ForgotPasswordFormClient next={next} />);
    expect(href("backToSignIn")).toBe(`/sign-in${query}`);
  });

  it("drops unsafe return destinations from the links", () => {
    render(<SignInFormClient next="https://evil.example" />);
    expect(href("registerTitle")).toBe("/register");
  });
});
