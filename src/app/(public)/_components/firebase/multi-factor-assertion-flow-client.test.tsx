import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MultiFactorInfo } from "@/lib/firebase/multi-factor";

const testHints = [
  { uid: "phone-primary", factorId: "phone" },
  { uid: "phone-backup", factorId: "phone" },
] as MultiFactorInfo[];

vi.mock("@/lib/firebase/multi-factor", () => ({
  phoneFactorId: "phone",
  totpFactorId: "totp",
}));
vi.mock("@firebase-oss/ui-core", () => ({
  getTranslation: (_ui: unknown, _section: string, key: string) => key,
}));
vi.mock("@firebase-oss/ui-react", () => ({
  useUI: () => ({ multiFactorResolver: { hints: testHints } }),
  useMultiFactorAssertionCleanup: () => {},
}));
vi.mock("./sms-multi-factor-phone-section-client", () => ({
  SmsMultiFactorPhoneSectionClient: ({ hint }: { hint: MultiFactorInfo }) => (
    <div data-testid="selected-factor">{hint.uid}</div>
  ),
}));
vi.mock("./sms-multi-factor-verify-form-client", () => ({
  SmsMultiFactorVerifyFormClient: () => null,
}));
vi.mock("./totp-multi-factor-assertion-form-client", () => ({
  TotpMultiFactorAssertionFormClient: () => null,
}));

import { MultiFactorAssertionFlowClient } from "./multi-factor-assertion-flow-client";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MultiFactorAssertionFlowClient", () => {
  it("keeps repeated phone factor instances distinct", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<MultiFactorAssertionFlowClient />);
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
