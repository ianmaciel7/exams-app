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

type DisplayNameFieldProps = ComponentProps<"input">;

function DisplayNameField(props: DisplayNameFieldProps) {
  const t = useTranslations("Auth");
  const { control } = useFormContext<{ displayName: string }>();
  return (
    <Controller
      control={control}
      name="displayName"
      render={({ field, fieldState }) => (
        <FormField
          name={field.name}
          invalid={!!fieldState.error}
          touched={fieldState.isTouched}
          dirty={fieldState.isDirty}
        >
          <FormFieldLabel>{t("displayNameLabel")}</FormFieldLabel>
          <Input
            {...props}
            {...field}
            required
            maxLength={50}
            autoComplete="name"
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

export { DisplayNameField };
