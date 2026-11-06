"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  FormField,
  FormFieldDescription,
  FormFieldError,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field";

type VerificationCodeFieldProps = Omit<
  ComponentProps<typeof FormField>,
  "children" | "invalid" | "onBlur"
> &
  Pick<
    ComponentProps<typeof OTPField>,
    "value" | "onValueChange" | "onBlur" | "autoSubmit" | "disabled"
  > & {
    label: ReactNode;
    description?: ReactNode;
    /** The error message; the field is invalid while it is set. */
    error?: string;
    length?: number;
  };

/**
 * A one-time code entry built on Base UI `OTPField` inside a `FormField`, so the
 * label, description and error are linked to the first slot by Base UI
 * (`one-time-code` autocomplete, numeric keyboard, paste across slots).
 */
function VerificationCodeField({
  label,
  description,
  error,
  length = 6,
  value,
  onValueChange,
  onBlur,
  autoSubmit,
  disabled,
  ...props
}: VerificationCodeFieldProps) {
  return (
    <FormField {...props} invalid={Boolean(error)} disabled={disabled}>
      <FormFieldLabel>{label}</FormFieldLabel>
      {description ? (
        <FormFieldDescription>{description}</FormFieldDescription>
      ) : null}
      <OTPField
        length={length}
        value={value}
        onValueChange={onValueChange}
        onBlur={onBlur}
        autoSubmit={autoSubmit}
      >
        {Array.from({ length }, (_, index) => (
          // The slots are positional and never reorder.
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length slots
          <OTPFieldInput key={index} />
        ))}
      </OTPField>
      <FormFieldError match={Boolean(error)}>{error}</FormFieldError>
    </FormField>
  );
}

export { VerificationCodeField };
