"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Button } from "@/components/ui/button";
import type { UserCredential } from "@/lib/firebase/multi-factor";
import { cn } from "@/lib/utils";
import { useMultiFactorAssertionFlowClient } from "../../_hooks/use-multi-factor-assertion-flow-client";
import { SmsMultiFactorPhoneSectionClient } from "./sms-multi-factor-phone-section-client";
import { SmsMultiFactorVerifyFormClient } from "./sms-multi-factor-verify-form-client";
import { TotpMultiFactorAssertionFormClient } from "./totp-multi-factor-assertion-form-client";

type MultiFactorAssertionFlowClientProps = useRender.ComponentProps<"div"> & {
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

  const picker = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col gap-2", className),
        children: (
          <>
            <p className="text-sm text-muted-foreground">{prompt}</p>
            {factors.map((factor) => (
              <Button
                key={factor.hint.uid}
                onClick={() => selectHint(factor.hint)}
              >
                {factor.label}
              </Button>
            ))}
          </>
        ),
      },
      props,
    ),
    state: { slot: "multi-factor-assertion-flow" },
  });

  if (step.kind === "totp") {
    return (
      <TotpMultiFactorAssertionFormClient
        hint={step.hint}
        onSuccess={onSuccess}
      />
    );
  }
  if (step.kind === "sms-verify") {
    return (
      <SmsMultiFactorVerifyFormClient
        verificationId={step.verificationId}
        onSuccess={onSuccess}
      />
    );
  }
  if (step.kind === "sms-phone") {
    return (
      <SmsMultiFactorPhoneSectionClient
        hint={step.hint}
        onCodeSent={setVerificationId}
      />
    );
  }

  return picker;
}

export { MultiFactorAssertionFlowClient };
