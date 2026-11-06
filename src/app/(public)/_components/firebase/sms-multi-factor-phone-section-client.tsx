"use client";
import type { ComponentProps } from "react";
import type { MultiFactorInfo } from "@/lib/firebase/multi-factor";
import { useSmsMultiFactorPhoneSectionClient } from "../../_hooks/use-sms-multi-factor-phone-section-client";
import { SmsMultiFactorPhoneSection } from "./sms-multi-factor-phone-section";

type SmsMultiFactorPhoneSectionClientProps = Omit<
  ComponentProps<typeof SmsMultiFactorPhoneSection>,
  keyof ReturnType<typeof useSmsMultiFactorPhoneSectionClient>
> & { hint: MultiFactorInfo; onCodeSent: (verificationId: string) => void };
function SmsMultiFactorPhoneSectionClient({
  hint,
  onCodeSent,
  ...props
}: SmsMultiFactorPhoneSectionClientProps) {
  const { onSendCode, ...state } = useSmsMultiFactorPhoneSectionClient({
    hint,
    onCodeSent,
  });
  return (
    <SmsMultiFactorPhoneSection {...props} {...state} onSendCode={onSendCode} />
  );
}

export { SmsMultiFactorPhoneSectionClient };
