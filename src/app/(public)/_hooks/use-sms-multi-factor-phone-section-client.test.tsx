import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { MultiFactorInfo } from "@/lib/firebase/multi-factor";

const mocks = vi.hoisted(() => ({
  verifier: undefined as object | undefined,
  action: vi.fn(),
  onCodeSent: vi.fn(),
}));
vi.mock("@firebase-oss/ui-react", () => ({
  useUI: () => ({ state: "idle" }),
  useRecaptchaVerifier: () => mocks.verifier,
  useSmsMultiFactorAssertionPhoneFormAction: () => mocks.action,
}));
vi.mock("@firebase-oss/ui-core", () => ({
  getTranslation: (_ui: unknown, _group: string, key: string) => key,
}));
vi.mock("@/lib/firebase/auth-error-message", () => ({
  getAuthActionErrorMessage: () => "Try again",
}));

import { useSmsMultiFactorPhoneSectionClient } from "./use-sms-multi-factor-phone-section-client";

const options = {
  hint: { uid: "phone", factorId: "phone" } as MultiFactorInfo,
  onCodeSent: mocks.onCodeSent,
};
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifier = undefined;
  mocks.action.mockResolvedValue("verification-id");
});
it("blocks sending until reCAPTCHA is ready and forwards the verification ID", async () => {
  const { result, rerender } = renderHook(() =>
    useSmsMultiFactorPhoneSectionClient(options),
  );
  expect(result.current.isPending).toBe(true);
  await act(result.current.onSendCode);
  expect(mocks.action).not.toHaveBeenCalled();
  mocks.verifier = {};
  rerender();
  expect(result.current.isPending).toBe(false);
  await act(result.current.onSendCode);
  expect(mocks.action).toHaveBeenCalledWith({
    hint: options.hint,
    recaptchaVerifier: mocks.verifier,
  });
  expect(mocks.onCodeSent).toHaveBeenCalledWith("verification-id");
});
it("keeps the phone step retryable when sending fails", async () => {
  mocks.verifier = {};
  mocks.action.mockRejectedValue(new Error("network"));
  const { result } = renderHook(() =>
    useSmsMultiFactorPhoneSectionClient(options),
  );
  await act(result.current.onSendCode);
  expect(result.current.error).toBe("Try again");
  expect(mocks.onCodeSent).not.toHaveBeenCalled();
  expect(result.current.isPending).toBe(false);
});
