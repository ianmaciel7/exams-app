"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormField,
  FormFieldError,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { Input } from "@/components/ui/input";

type PasswordFieldProps = ComponentProps<"input"> & {
  autoComplete: "current-password" | "new-password";
  /** Rendered beside the label, such as a password recovery link. */
  labelAction?: ReactNode;
};

function PasswordField({
  autoComplete,
  labelAction,
  ...props
}: PasswordFieldProps) {
  const t = useTranslations("Auth");
  const { control } = useFormContext<{ password: string }>();
  return (
    <Controller
      control={control}
      name="password"
      render={({ field, fieldState }) => (
        <FormField
          name={field.name}
          invalid={!!fieldState.error}
          touched={fieldState.isTouched}
          dirty={fieldState.isDirty}
        >
          <div className="flex items-center justify-between">
            <FormFieldLabel>{t("passwordLabel")}</FormFieldLabel>
            {labelAction}
          </div>
          <Input
            {...props}
            autoComplete={autoComplete}
            {...field}
            required
            type="password"
            autoCapitalize="none"
            spellCheck={false}
          />
          <FormFieldError match={!!fieldState.error}>
            {fieldState.error?.message}
          </FormFieldError>
        </FormField>
      )}
    />
  );
}

export { PasswordField };
