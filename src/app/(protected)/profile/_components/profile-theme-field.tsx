"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormField,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isThemePreference, themePreferences } from "@/lib/theme";
import type { ProfileValues } from "../_lib/definitions";

type ProfileThemeFieldProps = ComponentProps<typeof FormField>;

function ProfileThemeField(props: ProfileThemeFieldProps) {
  const t = useTranslations("Auth");
  const { control } = useFormContext<ProfileValues>();

  return (
    <Controller
      name="theme"
      control={control}
      render={({ field }) => (
        <FormField {...props} name={field.name}>
          <FormFieldLabel>{t("themeLabel")}</FormFieldLabel>
          <Select
            name={field.name}
            value={field.value}
            disabled={field.disabled}
            onValueChange={(value) => {
              if (isThemePreference(value)) field.onChange(value);
            }}
          >
            <SelectTrigger className="w-full" onBlur={field.onBlur}>
              <SelectValue>
                {(value) =>
                  isThemePreference(value)
                    ? t(`themeOptions.${value}`)
                    : undefined
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {themePreferences.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`themeOptions.${option}`)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  );
}

export { ProfileThemeField };
