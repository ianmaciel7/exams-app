"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ProfileValues } from "../_lib/definitions";

type ProfileEmailFieldProps = ComponentProps<typeof Field>;

function ProfileEmailField(props: ProfileEmailFieldProps) {
  const id = useId();
  const t = useTranslations("Auth");
  const { control } = useFormContext<ProfileValues>();

  return (
    <Controller
      name="email"
      control={control}
      rules={{ required: t("profileSaveError") }}
      render={({ field, fieldState }) => (
        <Field {...props} data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{t("emailLabel")}</FieldLabel>
          <Input
            {...field}
            id={id}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
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

export { ProfileEmailField };
