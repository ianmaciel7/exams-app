"use client";

import type { ComponentProps } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import { VerificationCodeField } from "@/components/ui/extensions/verification-code-field";
import { Spinner } from "@/components/ui/spinner";
import type {
  MultiFactorInfo,
  UserCredential,
} from "@/lib/firebase/multi-factor";
import { cn } from "@/lib/utils";
import { useTotpMultiFactorAssertionFormClient } from "../../_hooks/use-totp-multi-factor-assertion-form-client";

type TotpMultiFactorAssertionFormClientProps = Omit<
  ComponentProps<typeof Form>,
  "onSubmit"
> & {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
};

function TotpMultiFactorAssertionFormClient({
  hint,
  onSuccess,
  className,
  ...props
}: TotpMultiFactorAssertionFormClientProps) {
  const { codeLabel, control, isPending, onSubmit, rootError, submitLabel } =
    useTotpMultiFactorAssertionFormClient({ hint, onSuccess });

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

export { TotpMultiFactorAssertionFormClient };
