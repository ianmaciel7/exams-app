"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import {
  FormField,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { isLocale, locales } from "@/i18n/routing";
import { routes } from "@/lib/navigation";
import { isThemePreference, themePreferences } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useProfileForm } from "../_hooks/use-profile-form";
import {
  type ProfileAction,
  type ProfileSnapshot,
  profileFieldNames,
} from "../_lib/definitions";
import { ProfileAvatarFieldClient } from "./profile-avatar-field-client";
import { ProfileEmailDialog } from "./profile-email-dialog";

type ProfileFormProps = Omit<
  ComponentProps<typeof Form>,
  "action" | "onSubmit"
> & {
  /** Injected by the page; this component never knows where it saves. */
  action: ProfileAction;
  initialValues: ProfileSnapshot;
};

function ProfileForm({
  action,
  initialValues,
  className,
  ...props
}: ProfileFormProps) {
  const { t, state, pending, formAction, avatarFile, pickAvatar } =
    useProfileForm(action, initialValues);

  // Edits made while a save is pending would be reset with the form.
  return (
    <Form
      {...props}
      action={formAction}
      validationMode="onBlur"
      className={cn("w-full", className)}
    >
      <FieldGroup className="gap-4">
        {state.hasError && (
          <Alert variant="destructive">
            <AlertDescription>{t("profileSaveError")}</AlertDescription>
          </Alert>
        )}

        <ProfileAvatarFieldClient
          file={avatarFile}
          onPick={pickAvatar}
          pending={pending}
          savedCount={state.savedCount}
          identity={{
            photoURL: state.photoURL,
            displayName: state.values.displayName,
            email: state.values.email,
          }}
        />

        <FormField name={profileFieldNames.displayName}>
          <FormFieldLabel>{t("displayNameLabel")}</FormFieldLabel>
          <Input
            readOnly={pending}
            name={profileFieldNames.displayName}
            defaultValue={state.values.displayName}
            autoComplete="name"
            placeholder={t("notSet")}
            maxLength={100}
          />
        </FormField>

        <FormField name={profileFieldNames.email}>
          <FormFieldLabel>{t("emailLabel")}</FormFieldLabel>
          <div className="flex gap-2">
            <Input
              readOnly
              value={state.values.email}
              type="email"
              autoComplete="email"
              className="flex-1"
            />
            <ProfileEmailDialog email={state.values.email} />
          </div>
        </FormField>

        <FormField name={profileFieldNames.locale}>
          <FormFieldLabel>{t("languageLabel")}</FormFieldLabel>
          <Select
            readOnly={pending}
            key={state.values.locale}
            name={profileFieldNames.locale}
            defaultValue={state.values.locale}
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

        <FormField name={profileFieldNames.theme}>
          <FormFieldLabel>{t("themeLabel")}</FormFieldLabel>
          <Select
            readOnly={pending}
            key={state.values.theme}
            name={profileFieldNames.theme}
            defaultValue={state.values.theme}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value) =>
                  isThemePreference(value)
                    ? t(`themeOptions.${value}`)
                    : undefined
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

        <Button
          type="submit"
          className="w-full"
          disabled={pending}
          focusableWhenDisabled
        >
          {pending && <Spinner data-icon="inline-start" aria-hidden="true" />}
          {t(pending ? "savingProfile" : "saveProfile")}
        </Button>
        <Link
          href={routes.home}
          className={buttonVariants({
            variant: "link",
            size: "sm",
            className: "w-full text-xs",
          })}
        >
          {t("backToHome")}
        </Link>
      </FieldGroup>
    </Form>
  );
}

export { ProfileForm };
