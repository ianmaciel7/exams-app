import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
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

function containsDuplicateKey(entry: unknown[]) {
  return entry.some((part) => String(part).includes("same key"));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("keeps repeated phone factor instances distinct", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const ref = createRef<HTMLDivElement>();
  render(
    <MultiFactorAssertionFlowClient
      id="mfa-flow"
      aria-label="verification"
      className="custom-flow"
      render={<section />}
      ref={ref}
    />,
  );
  const root = document.getElementById("mfa-flow");
  expect(root?.tagName).toBe("SECTION");
  expect(ref.current).toBe(root);
  const choices = screen.getAllByRole("button", {
    name: "mfaSmsVerification",
  });
  expect(choices).toHaveLength(2);
  const duplicateKeyWarning = errorSpy.mock.calls.some(containsDuplicateKey);
  expect(duplicateKeyWarning).toBe(false);
  fireEvent.click(choices[1]);
  expect(document.getElementById("mfa-flow")).toBe(root);
  expect(root?.getAttribute("aria-label")).toBe("verification");
  expect(root?.classList.contains("custom-flow")).toBe(true);
  expect(ref.current).toBe(root);
  expect(screen.getByTestId("selected-factor").textContent).toBe(
    "phone-backup",
  );
});
