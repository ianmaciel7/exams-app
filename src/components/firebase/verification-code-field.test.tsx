import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { VerificationCodeField } from "@/components/firebase/verification-code-field";

afterEach(cleanup);

describe("VerificationCodeField", () => {
  it("renders one slot per digit, labelled, with a one-time-code first slot", () => {
    render(
      <VerificationCodeField
        name="verificationCode"
        label="Code"
        description="Sent by SMS."
        value="12"
        onValueChange={() => {}}
      />,
    );
    const slots = screen.getAllByRole("textbox");
    expect(slots).toHaveLength(6);
    expect(slots[0]?.getAttribute("autocomplete")).toBe("one-time-code");
    expect(screen.getByText("Code")).toBeTruthy();
    expect(screen.getByText("Sent by SMS.")).toBeTruthy();
  });

  it("announces the error and marks the slots invalid", () => {
    render(
      <VerificationCodeField
        name="verificationCode"
        label="Code"
        value=""
        onValueChange={() => {}}
        error="Invalid code"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Invalid code");
    expect(
      document
        .querySelector('[data-slot="otp-field-input"]')
        ?.getAttribute("aria-invalid"),
    ).toBe("true");
  });
});
