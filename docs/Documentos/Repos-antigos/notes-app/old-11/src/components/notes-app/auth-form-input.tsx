"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type AuthFormInputProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof Input>,
  "id" | "name"
> & {
  name: FieldPath<TFieldValues>;
  label: ReactNode;
  labelAction?: ReactNode;
};

function AuthFormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  labelAction,
  ...props
}: AuthFormInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-slot="auth-form-input" data-invalid={!!fieldState.error}>
          {labelAction ? (
            <Field orientation="horizontal">
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
              {labelAction}
            </Field>
          ) : (
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
          )}
          <Input
            {...props}
            {...field}
            id={name}
            aria-invalid={!!fieldState.error}
          />
          {fieldState.error && (
            <FieldError>{fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  );
}

export { AuthFormInput, type AuthFormInputProps };
