"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ProfileValues } from "../_lib/definitions";

type ProfileDisplayNameFieldProps = ComponentProps<typeof Field>;

function ProfileDisplayNameField(props: ProfileDisplayNameFieldProps) {
  const id = useId();
  const t = useTranslations("Auth");
  const { control } = useFormContext<ProfileValues>();

  return (
    <Controller
      name="displayName"
      control={control}
      render={({ field, fieldState }) => (
        <Field {...props} data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{t("displayNameLabel")}</FieldLabel>
          <Input
            {...field}
            id={id}
            autoComplete="name"
            placeholder={t("notSet")}
            maxLength={100}
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.invalid ? `${id}-error` : undefined}
          />
          {fieldState.invalid && (
            <FieldError id={`${id}-error`} errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}

export { ProfileDisplayNameField };
