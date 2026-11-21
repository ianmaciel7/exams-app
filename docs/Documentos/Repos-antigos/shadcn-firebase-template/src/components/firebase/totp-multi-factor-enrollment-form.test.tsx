import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TotpSecret } from "firebase/auth";

const mocks = vi.hoisted(() => ({
  assertionForEnrollment: vi.fn(() => ({ kind: "totp-assertion" })),
  enroll: vi.fn(async () => {}),
}));
vi.mock("firebase/auth", () => ({
  TotpMultiFactorGenerator: { assertionForEnrollment: mocks.assertionForEnrollment },
}));
vi.mock("@firebase-oss/ui-core", () => ({
  FirebaseUIError: class FirebaseUIError extends Error {},
  enrollWithMultiFactorAssertion: mocks.enroll,
  generateTotpQrCode: () => "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
  generateTotpSecret: vi.fn(),
  getTranslation: (_ui: unknown, _group: string, key: string) => key,
}));
vi.mock("@firebase-oss/ui-react", () => ({
  useUI: () => ({ state: "idle" }),
  useMultiFactorTotpAuthVerifyFormSchema: () => ({}),
  useMultiFactorTotpAuthNumberFormSchema: () => ({}),
}));
vi.mock("@hookform/resolvers/standard-schema", () => ({
  standardSchemaResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));
vi.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({ children: _children, ...props }: ComponentProps<"input">) => <input {...props} />,
  InputOTPGroup: ({ children }: PropsWithChildren) => <div>{children}</div>,
  InputOTPSlot: () => null,
}));

import { MultiFactorEnrollmentVerifyTotpForm } from "./totp-multi-factor-enrollment-form";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TOTP enrollment", () => {
  it("uses the chosen display name, not the verification code, to enroll the factor", async () => {
    const secret = { secretKey: { toString: () => "safe-test-secret" } } as TotpSecret;
    const onSuccess = vi.fn();
    render(<MultiFactorEnrollmentVerifyTotpForm secret={secret} displayName="My laptop" onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText("verificationCode"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "verifyCode" }));
    await waitFor(() => expect(mocks.enroll).toHaveBeenCalledWith(
      expect.anything(), { kind: "totp-assertion" }, "My laptop",
    ));
    expect(mocks.assertionForEnrollment).toHaveBeenCalledWith(secret, "123456");
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
