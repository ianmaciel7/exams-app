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
import { isThemePreference, themePreferences } from "@/lib/theme";
import { profileFieldNames } from "../_lib/form-data";
import { ProfileFormContext } from "../_lib/profile-form-context";

type ProfileThemeFieldProps = ComponentProps<typeof FormField>;

function ProfileThemeField(props: ProfileThemeFieldProps) {
  const t = useTranslations("Auth");
  const { submission } = use(ProfileFormContext);
  // Edits made while a save is pending would be reset with the form.
  const { pending } = useFormStatus();
  const current = submission.values.theme;

  return (
    <FormField {...props} name={profileFieldNames.theme}>
      <FormFieldLabel>{t("themeLabel")}</FormFieldLabel>
      <Select
        readOnly={pending}
        key={current}
        name={profileFieldNames.theme}
        defaultValue={current}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {(value) =>
              isThemePreference(value) ? t(`themeOptions.${value}`) : undefined
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
  );
}

export { ProfileThemeField };
