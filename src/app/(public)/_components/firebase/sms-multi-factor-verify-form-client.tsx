"use client";
import type { ComponentProps } from "react";
import { SmsMultiFactorVerifyForm } from "@/components/firebase/sms-multi-factor-verify-form";
import type { UserCredential } from "@/lib/firebase/multi-factor";
import { useSmsMultiFactorVerifyFormClient } from "../../_hooks/use-sms-multi-factor-verify-form-client";

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
