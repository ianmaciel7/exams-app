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
import type { ProfileValues } from "../_lib/definitions";

type ProfileEmailFieldProps = ComponentProps<typeof FormField>;

function ProfileEmailField(props: ProfileEmailFieldProps) {
  const t = useTranslations("Auth");
  const { control } = useFormContext<ProfileValues>();

  return (
    <Controller
      name="email"
      control={control}
      render={({ field }) => (
        <FormField {...props} name={field.name}>
          <FormFieldLabel>{t("emailLabel")}</FormFieldLabel>
          <Input
            {...field}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={254}
          />
          <FormFieldError match="valueMissing">
            {t("emailRequired")}
          </FormFieldError>
          <FormFieldError match="typeMismatch">
            {t("emailInvalid")}
          </FormFieldError>
        </FormField>
      )}
    />
  );
}

export { ProfileEmailField };
