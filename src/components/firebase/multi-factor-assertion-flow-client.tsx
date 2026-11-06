"use client";

import type { ComponentProps } from "react";
import {
  MultiFactorAssertionFlow,
  MultiFactorAssertionFlowPicker,
} from "@/components/firebase/multi-factor-assertion-flow";
import { useMultiFactorAssertionFlowClient } from "@/hooks/use-multi-factor-assertion-flow-client";
import type { UserCredential } from "@/lib/firebase/multi-factor";
import { SmsMultiFactorPhoneSectionClient } from "./sms-multi-factor-phone-section-client";
import { SmsMultiFactorVerifyFormClient } from "./sms-multi-factor-verify-form-client";
import { TotpMultiFactorAssertionFormClient } from "./totp-multi-factor-assertion-form-client";

type MultiFactorAssertionFlowClientProps = ComponentProps<
  typeof MultiFactorAssertionFlow
> & {
  onSuccess?: (credential: UserCredential) => void;
};

function MultiFactorAssertionFlowClient({
  onSuccess,
  className,
  render,
  ...props
}: MultiFactorAssertionFlowClientProps) {
  const { factors, step, prompt, selectHint, setVerificationId } =
    useMultiFactorAssertionFlowClient();

  return (
    <MultiFactorAssertionFlow {...props} className={className} render={render}>
      {step.kind === "totp" ? (
        <TotpMultiFactorAssertionFormClient
          hint={step.hint}
          onSuccess={onSuccess}
        />
      ) : step.kind === "sms-verify" ? (
        <SmsMultiFactorVerifyFormClient
          verificationId={step.verificationId}
          onSuccess={onSuccess}
        />
      ) : step.kind === "sms-phone" ? (
        <SmsMultiFactorPhoneSectionClient
          hint={step.hint}
          onCodeSent={setVerificationId}
        />
      ) : (
        <MultiFactorAssertionFlowPicker
          factors={factors}
          prompt={prompt}
          selectHint={selectHint}
        />
      )}
    </MultiFactorAssertionFlow>
  );
}

export { MultiFactorAssertionFlowClient };
