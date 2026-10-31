"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isLocale, locales } from "@/i18n/routing";
import type { ProfileValues } from "../_lib/definitions";

type ProfileLocaleFieldProps = ComponentProps<typeof Field>;

function ProfileLocaleField(props: ProfileLocaleFieldProps) {
  const id = useId();
  const t = useTranslations("Auth");
  const { control } = useFormContext<ProfileValues>();

  return (
    <Controller
      name="locale"
      control={control}
      render={({ field, fieldState }) => (
        <Field {...props} data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{t("languageLabel")}</FieldLabel>
          <Select
            name={field.name}
            value={field.value}
            disabled={field.disabled}
            onValueChange={(value) => {
              if (isLocale(value)) field.onChange(value);
            }}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? `${id}-error` : undefined}
              onBlur={field.onBlur}
            >
              <SelectValue>
                {(value) =>
                  isLocale(value) ? t(`languageOptions.${value}`) : undefined
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {locales.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`languageOptions.${option}`)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {fieldState.invalid && (
            <FieldError id={`${id}-error`} errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}

export { ProfileLocaleField };
