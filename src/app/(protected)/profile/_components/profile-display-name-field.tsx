"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormField,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { Input } from "@/components/ui/input";
import type { ProfileValues } from "../_lib/definitions";

type ProfileDisplayNameFieldProps = ComponentProps<typeof FormField>;

function ProfileDisplayNameField(props: ProfileDisplayNameFieldProps) {
  const t = useTranslations("Auth");
  const { control } = useFormContext<ProfileValues>();

  return (
    <Controller
      name="displayName"
      control={control}
      render={({ field }) => (
        <FormField {...props} name={field.name}>
          <FormFieldLabel>{t("displayNameLabel")}</FormFieldLabel>
          <Input
            {...field}
            autoComplete="name"
            placeholder={t("notSet")}
            maxLength={100}
          />
        </FormField>
      )}
    />
  );
}

export { ProfileDisplayNameField };
