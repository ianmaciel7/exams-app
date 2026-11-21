"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { LanguageSelect } from "@/components/notes-app/language-select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

type SettingsFormProps = ComponentProps<typeof FieldGroup>;

function SettingsForm({ ...props }: SettingsFormProps) {
  const t = useTranslations("settings");
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <FieldGroup {...props} data-slot="settings-form">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="settings-form-theme-switch">
            {t("darkMode")}
          </FieldLabel>
          <FieldDescription>{t("darkModeDescription")}</FieldDescription>
        </FieldContent>
        <Switch
          id="settings-form-theme-switch"
          checked={resolvedTheme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </Field>
      <Field>
        <FieldLabel>{t("language")}</FieldLabel>
        <LanguageSelect />
      </Field>
    </FieldGroup>
  );
}

export { SettingsForm, type SettingsFormProps };
