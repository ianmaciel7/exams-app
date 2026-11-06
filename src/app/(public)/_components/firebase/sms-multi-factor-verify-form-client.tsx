"use client";

import type { ComponentProps } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import { VerificationCodeField } from "@/components/ui/extensions/verification-code-field";
import { Spinner } from "@/components/ui/spinner";
import type { UserCredential } from "@/lib/firebase/multi-factor";
import { cn } from "@/lib/utils";
import { useSmsMultiFactorVerifyFormClient } from "../../_hooks/use-sms-multi-factor-verify-form-client";

type SmsMultiFactorVerifyFormClientProps = Omit<
  ComponentProps<typeof Form>,
  "onSubmit"
> & {
  verificationId: string;
  onSuccess?: (credential: UserCredential) => void;
};

function SmsMultiFactorVerifyFormClient({
  verificationId,
  onSuccess,
  className,
  ...props
}: SmsMultiFactorVerifyFormClientProps) {
  const {
    codeDescription,
    codeLabel,
    control,
    isPending,
    onSubmit,
    rootError,
    submitLabel,
  } = useSmsMultiFactorVerifyFormClient({ verificationId, onSuccess });

  return (
    <Form
      {...props}
      onSubmit={onSubmit}
      className={cn("flex flex-col gap-y-4", className)}
    >
      <Controller
        control={control}
        name="verificationCode"
        render={({ field, fieldState }) => (
          <VerificationCodeField
            name={field.name}
            label={codeLabel}
            description={codeDescription}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button type="submit" disabled={isPending} focusableWhenDisabled>
        {isPending ? (
          <Spinner data-icon="inline-start" aria-hidden="true" />
        ) : null}
        {submitLabel}
      </Button>
      {rootError ? <FormError>{rootError}</FormError> : null}
    </Form>
  );
}

export { SmsMultiFactorVerifyFormClient };
