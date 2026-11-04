"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  FormField,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { Input } from "@/components/ui/input";
import { useProfileFormContext } from "../_hooks/use-profile-form-context";
import { profileFieldNames } from "../_lib/form-data";

type ProfileDisplayNameFieldProps = ComponentProps<typeof FormField>;

function ProfileDisplayNameField(props: ProfileDisplayNameFieldProps) {
  const t = useTranslations("Auth");
  const { submission } = useProfileFormContext();

  return (
    <FormField {...props} name={profileFieldNames.displayName}>
      <FormFieldLabel>{t("displayNameLabel")}</FormFieldLabel>
      <Input
        name={profileFieldNames.displayName}
        defaultValue={submission.values.displayName}
        autoComplete="name"
        placeholder={t("notSet")}
        maxLength={100}
      />
    </FormField>
  );
}

export { ProfileDisplayNameField };
