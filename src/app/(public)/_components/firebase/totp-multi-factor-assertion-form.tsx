import type { ComponentProps } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import { VerificationCodeField } from "@/components/ui/extensions/verification-code-field";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { useTotpMultiFactorAssertionFormClient } from "../../_hooks/use-totp-multi-factor-assertion-form-client";

type TotpMultiFactorAssertionFormProps = Omit<
  ComponentProps<typeof Form>,
  "onSubmit"
> &
  ReturnType<typeof useTotpMultiFactorAssertionFormClient>;
function TotpMultiFactorAssertionForm({
  codeLabel,
  control,
  isPending,
  onSubmit,
  rootError,
  submitLabel,
  className,
  ...props
}: TotpMultiFactorAssertionFormProps) {
  return (
    <Form
      {...props}
      onSubmit={onSubmit}
      className={cn("flex flex-col gap-y-4", className)}
    >
      <FieldGroup>
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
      </FieldGroup>
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

export { TotpMultiFactorAssertionForm };
