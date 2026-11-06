"use client";
import type { ComponentProps } from "react";
import type {
  MultiFactorInfo,
  UserCredential,
} from "@/lib/firebase/multi-factor";
import { useTotpMultiFactorAssertionFormClient } from "../../_hooks/use-totp-multi-factor-assertion-form-client";
import { TotpMultiFactorAssertionForm } from "./totp-multi-factor-assertion-form";

type TotpMultiFactorAssertionFormClientProps = Omit<
  ComponentProps<typeof TotpMultiFactorAssertionForm>,
  keyof ReturnType<typeof useTotpMultiFactorAssertionFormClient>
> & { hint: MultiFactorInfo; onSuccess?: (credential: UserCredential) => void };
function TotpMultiFactorAssertionFormClient({
  hint,
  onSuccess,
  ...props
}: TotpMultiFactorAssertionFormClientProps) {
  const { onSubmit, ...state } = useTotpMultiFactorAssertionFormClient({
    hint,
    onSuccess,
  });
  return (
    <TotpMultiFactorAssertionForm {...props} {...state} onSubmit={onSubmit} />
  );
}

export { TotpMultiFactorAssertionFormClient };
