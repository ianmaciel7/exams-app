"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
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
import { useProfileFormContext } from "../_hooks/use-profile-form-context";
import { profileFieldNames } from "../_lib/form-data";

type ProfileThemeFieldProps = ComponentProps<typeof FormField>;

function ProfileThemeField(props: ProfileThemeFieldProps) {
  const t = useTranslations("Auth");
  const { submission } = useProfileFormContext();
  const current = submission.values.theme;

  return (
    <FormField {...props} name={profileFieldNames.theme}>
      <FormFieldLabel>{t("themeLabel")}</FormFieldLabel>
      <Select
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
