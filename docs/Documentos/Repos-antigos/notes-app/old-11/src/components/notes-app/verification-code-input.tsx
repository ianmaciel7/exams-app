"use client";

import type { ComponentProps, ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type VerificationCodeInputProps = Omit<
  ComponentProps<typeof Field>,
  "children"
> & {
  label: ReactNode;
  description?: ReactNode;
};

function VerificationCodeInput({
  label,
  description,
  ...props
}: VerificationCodeInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name="verificationCode"
      render={({ field, fieldState }) => (
        <Field
          data-slot="verification-code-input"
          {...props}
          data-invalid={!!fieldState.error}
        >
          <FieldLabel htmlFor="verificationCode">{label}</FieldLabel>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          <InputOTP
            id="verificationCode"
            maxLength={6}
            {...field}
            aria-invalid={!!fieldState.error}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {fieldState.error ? (
            <FieldError>{fieldState.error.message}</FieldError>
          ) : null}
        </Field>
      )}
    />
  );
}

export { VerificationCodeInput, type VerificationCodeInputProps };
