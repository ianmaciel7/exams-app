import type { ComponentProps } from "react";
import { type Control, Controller } from "react-hook-form";
import { VerificationCodeField } from "@/components/firebase/verification-code-field";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SmsMultiFactorVerifyFormProps = ComponentProps<typeof Form> & {
  codeLabel: string;
  control: Control<{ verificationId: string; verificationCode: string }>;
  isPending: boolean;
  rootError?: string;
  submitLabel: string;
  codeDescription: string;
};
function SmsMultiFactorVerifyForm({
  codeLabel,
  control,
  isPending,
  onSubmit,
  rootError,
  submitLabel,
  codeDescription,
  className,
  ...props
}: SmsMultiFactorVerifyFormProps) {
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
              description={codeDescription}
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

export { SmsMultiFactorVerifyForm };
