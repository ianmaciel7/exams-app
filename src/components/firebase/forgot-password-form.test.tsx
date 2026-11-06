import { cleanup, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, expect, it, vi } from "vitest";
import {
  ForgotPasswordForm,
  ForgotPasswordFormContent,
} from "./forgot-password-form";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

function RecoveryForm({ emailSent = false }: { emailSent?: boolean }) {
  const form = useForm({ defaultValues: { email: "" } });
  return (
    <ForgotPasswordForm>
      <FormProvider {...form}>
        <ForgotPasswordFormContent
          emailSent={emailSent}
          isPending={false}
          policies={<span>{"Injected policies"}</span>}
        />
      </FormProvider>
    </ForgotPasswordForm>
  );
}

afterEach(cleanup);
it("renders recovery fields and injected policies without a Firebase provider", () => {
  render(<RecoveryForm />);
  expect(
    screen.getByRole("textbox", { name: "emailAddressLabel" }),
  ).toBeTruthy();
  expect(screen.getByText("Injected policies")).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "backToSignIn" }).getAttribute("href"),
  ).toBe("/sign-in");
});
it("shows recovery success while preserving the return link", () => {
  const view = render(<RecoveryForm />);
  view.rerender(<RecoveryForm emailSent />);
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("resetEmailSent");
  expect(screen.getByRole("link", { name: "backToSignIn" })).toBeTruthy();
});
