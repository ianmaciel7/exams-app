import { getTranslation } from "@firebase-oss/ui-core";
import { useMultiFactorAssertionCleanup, useUI } from "@firebase-oss/ui-react";
import { useState } from "react";
import {
  type MultiFactorInfo,
  phoneFactorId,
  totpFactorId,
} from "@/lib/firebase/multi-factor";

type Step =
  | { kind: "picker" }
  | { kind: "totp"; hint: MultiFactorInfo }
  | { kind: "sms-phone"; hint: MultiFactorInfo }
  | { kind: "sms-verify"; verificationId: string };

export function useMultiFactorAssertionFlowClient() {
  const ui = useUI();
  const resolver = ui.multiFactorResolver;
  useMultiFactorAssertionCleanup();

  if (!resolver) {
    throw new Error(
      "MultiFactorAssertionFlowClient requires a multi-factor resolver",
    );
  }

  // With a single hint the factor is selected by default to save a step.
  const [hint, setHint] = useState<MultiFactorInfo | undefined>(
    resolver.hints.length === 1 ? resolver.hints[0] : undefined,
  );
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const factors = resolver.hints.flatMap((candidate) => {
    const label =
      candidate.factorId === totpFactorId
        ? getTranslation(ui, "labels", "mfaTotpVerification")
        : candidate.factorId === phoneFactorId
          ? getTranslation(ui, "labels", "mfaSmsVerification")
          : null;
    return label ? [{ hint: candidate, label }] : [];
  });

  const step: Step =
    hint?.factorId === totpFactorId
      ? { kind: "totp", hint }
      : hint?.factorId === phoneFactorId
        ? verificationId
          ? { kind: "sms-verify", verificationId }
          : { kind: "sms-phone", hint }
        : { kind: "picker" };

  return {
    factors,
    step,
    prompt: getTranslation(ui, "prompts", "mfaAssertionFactorPrompt"),
    selectHint: setHint,
    setVerificationId,
  };
}
