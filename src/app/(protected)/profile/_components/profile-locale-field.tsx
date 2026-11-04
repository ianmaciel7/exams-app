"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { use } from "react";
import { useFormStatus } from "react-dom";
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
import { isLocale, locales } from "@/i18n/routing";
import { profileFieldNames } from "../_lib/form-data";
import { ProfileFormContext } from "../_lib/profile-form-context";

type ProfileLocaleFieldProps = ComponentProps<typeof FormField>;

function ProfileLocaleField(props: ProfileLocaleFieldProps) {
  const t = useTranslations("Auth");
  const { submission } = use(ProfileFormContext);
  // Edits made while a save is pending would be reset with the form.
  const { pending } = useFormStatus();
  const current = submission.values.locale;

  return (
    <FormField {...props} name={profileFieldNames.locale}>
      <FormFieldLabel>{t("languageLabel")}</FormFieldLabel>
      <Select
        readOnly={pending}
        key={current}
        name={profileFieldNames.locale}
        defaultValue={current}
      >
        <SelectTrigger className="w-full">
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
    </FormField>
  );
}

export { ProfileLocaleField };
