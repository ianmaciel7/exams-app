"use client";
import type { ComponentProps } from "react";
import { SmsMultiFactorVerifyForm } from "@/components/firebase/sms-multi-factor-verify-form";
import { useSmsMultiFactorVerifyFormClient } from "@/hooks/use-sms-multi-factor-verify-form-client";
import type { UserCredential } from "@/lib/firebase/multi-factor";

type SmsMultiFactorVerifyFormClientProps = Omit<
  ComponentProps<typeof SmsMultiFactorVerifyForm>,
  keyof ReturnType<typeof useSmsMultiFactorVerifyFormClient>
> & {
  verificationId: string;
  onSuccess?: (credential: UserCredential) => void;
};
function SmsMultiFactorVerifyFormClient({
  verificationId,
  onSuccess,
  ...props
}: SmsMultiFactorVerifyFormClientProps) {
  const { onSubmit, ...state } = useSmsMultiFactorVerifyFormClient({
    verificationId,
    onSuccess,
  });
  return <SmsMultiFactorVerifyForm {...props} {...state} onSubmit={onSubmit} />;
}

export { SmsMultiFactorVerifyFormClient };
