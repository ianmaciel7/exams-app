"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  FormField,
  FormFieldError,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { Input } from "@/components/ui/input";
import { useProfileFormContext } from "../_hooks/use-profile-form-context";
import { profileFieldNames } from "../_lib/form-data";

type ProfileEmailFieldProps = ComponentProps<typeof FormField>;

function ProfileEmailField(props: ProfileEmailFieldProps) {
  const t = useTranslations("Auth");
  const { submission } = useProfileFormContext();

  return (
    <FormField {...props} name={profileFieldNames.email}>
      <FormFieldLabel>{t("emailLabel")}</FormFieldLabel>
      <Input
        name={profileFieldNames.email}
        defaultValue={submission.values.email}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        maxLength={254}
      />
      <FormFieldError match="valueMissing">{t("emailRequired")}</FormFieldError>
      <FormFieldError match="typeMismatch">{t("emailInvalid")}</FormFieldError>
    </FormField>
  );
}

export { ProfileEmailField };
