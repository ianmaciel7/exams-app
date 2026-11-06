"use client";
import type { ComponentProps } from "react";
import { SmsMultiFactorPhoneSection } from "@/components/firebase/sms-multi-factor-phone-section";
import type { MultiFactorInfo } from "@/lib/firebase/multi-factor";
import { useSmsMultiFactorPhoneSectionClient } from "../../_hooks/use-sms-multi-factor-phone-section-client";

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
