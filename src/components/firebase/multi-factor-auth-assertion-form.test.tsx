import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PhoneMultiFactorGenerator, type MultiFactorInfo } from "firebase/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

const testHints = [
  { uid: "phone-primary", factorId: PhoneMultiFactorGenerator.FACTOR_ID },
  { uid: "phone-backup", factorId: PhoneMultiFactorGenerator.FACTOR_ID },
] as MultiFactorInfo[];

vi.mock("@firebase-oss/ui-core", () => ({
  getTranslation: (_ui: unknown, _section: string, key: string) => key,
}));
vi.mock("@firebase-oss/ui-react", () => ({
  useUI: () => ({ multiFactorResolver: { hints: testHints } }),
  useMultiFactorAssertionCleanup: () => {},
}));
vi.mock("./sms-multi-factor-assertion-form", () => ({
  SmsMultiFactorAssertionForm: ({ hint }: { hint: MultiFactorInfo }) => (
    <div data-testid="selected-factor">{hint.uid}</div>
  ),
}));
vi.mock("./totp-multi-factor-assertion-form", () => ({
  TotpMultiFactorAssertionForm: ({ hint }: { hint: MultiFactorInfo }) => (
    <div data-testid="selected-factor">{hint.uid}</div>
  ),
}));

import { MultiFactorAuthAssertionForm } from "./multi-factor-auth-assertion-form";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MultiFactorAuthAssertionForm", () => {
  it("keeps repeated phone factor instances distinct", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<MultiFactorAuthAssertionForm />);
    const choices = screen.getAllByRole("button", {
      name: "mfaSmsVerification",
    });
    expect(choices).toHaveLength(2);
    const duplicateKeyWarning = errorSpy.mock.calls.some((entry) =>
      entry.some((part) => String(part).includes("same key")),
    );
    expect(duplicateKeyWarning).toBe(false);
    fireEvent.click(choices[1]);
    expect(screen.getByTestId("selected-factor").textContent).toBe(
      "phone-backup",
    );
  });
});
