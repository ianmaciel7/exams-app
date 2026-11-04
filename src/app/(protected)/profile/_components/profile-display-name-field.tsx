"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { use } from "react";
import { useFormStatus } from "react-dom";
import {
  FormField,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { Input } from "@/components/ui/input";
import { profileFieldNames } from "../_lib/form-data";
import { ProfileFormContext } from "../_lib/profile-form-context";

type ProfileDisplayNameFieldProps = ComponentProps<typeof FormField>;

function ProfileDisplayNameField(props: ProfileDisplayNameFieldProps) {
  const t = useTranslations("Auth");
  const { submission } = use(ProfileFormContext);
  // Edits made while a save is pending would be reset with the form.
  const { pending } = useFormStatus();

  return (
    <FormField {...props} name={profileFieldNames.displayName}>
      <FormFieldLabel>{t("displayNameLabel")}</FormFieldLabel>
      <Input
        readOnly={pending}
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
