"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormField,
  FormFieldError,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { Input } from "@/components/ui/input";

type EmailFieldProps = ComponentProps<"input"> & {
  autoComplete: "email" | "username";
};

function EmailField({ autoComplete, ...props }: EmailFieldProps) {
  const t = useTranslations("Auth");
  const { control } = useFormContext<{ email: string }>();
  return (
    <Controller
      control={control}
      name="email"
      render={({ field, fieldState }) => (
        <FormField
          name={field.name}
          invalid={!!fieldState.error}
          touched={fieldState.isTouched}
          dirty={fieldState.isDirty}
        >
          <FormFieldLabel>{t("emailLabel")}</FormFieldLabel>
          <Input
            {...props}
            autoComplete={autoComplete}
            {...field}
            required
            type="email"
            inputMode="email"
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

export { EmailField };
