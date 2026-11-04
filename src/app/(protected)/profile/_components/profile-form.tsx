"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  type ComponentProps,
  use,
  useActionState,
  useEffect,
  useState,
} from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import {
  FormField,
  FormFieldError,
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
import { useNavigation } from "@/hooks/use-navigation";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale, locales } from "@/i18n/routing";
import { routes } from "@/lib/navigation";
import { isThemePreference, themePreferences } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useProfileSaveFeedback } from "../_hooks/use-profile-save-feedback";
import { profileFieldNames } from "../_lib/form-data";
import { createProfileAction } from "../_lib/profile-action";
import { forgetProfile, loadProfile } from "../_lib/profile-resource";
import { ProfileAvatarFieldClient } from "./profile-avatar-field-client";

type ProfileFormProps = Omit<
  ComponentProps<typeof Form>,
  "action" | "onSubmit"
>;

function ProfileForm({ className, ...props }: ProfileFormProps) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { setTheme } = useTheme();
  const { refresh } = useNavigation();
  const { user } = useSession();
  if (!user) throw new Error("Protected components require AuthGuardClient");

  // State pins the read once mounted; until then the shared cache keeps the
  // promise stable across suspended render attempts.
  const [profile] = useState(() =>
    loadProfile({ uid: user.uid, activeLocale, refresh, setTheme }),
  );
  const loaded = use(profile);
  useEffect(() => {
    forgetProfile(user.uid, activeLocale);
  }, [user.uid, activeLocale]);

  const { onSaved } = useProfileSaveFeedback({ activeLocale, setTheme });
  const [state, dispatch, pending] = useActionState(
    createProfileAction({ user, errorMessage: t("profileSaveError"), onSaved }),
    {
      saved: loaded,
      values: loaded,
      avatarFile: null,
      error: null,
      savedCount: 0,
    },
  );
  // A file picked since the last Action result; the result then owns the
  // pending upload (kept after a failed save, cleared after a saved one).
  const [pick, setPick] = useState<{ file: File; after: typeof state } | null>(
    null,
  );
  const pickedAvatar = pick?.after === state ? pick.file : null;

  function formAction(formData: FormData) {
    // The picked file is added here rather than read from the file input, which
    // the browser clears when React resets the form after an Action.
    if (pickedAvatar) formData.set(profileFieldNames.avatar, pickedAvatar);
    dispatch(formData);
  }

  // Edits made while a save is pending would be reset with the form.
  return (
    <Form
      {...props}
      action={formAction}
      validationMode="onBlur"
      className={cn("w-full", className)}
    >
      <FieldGroup className="gap-4">
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <ProfileAvatarFieldClient
          file={pickedAvatar ?? state.avatarFile}
          onPick={(file) => setPick({ file, after: state })}
          pending={pending}
          savedCount={state.savedCount}
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
          <Input
            readOnly={pending}
            name={profileFieldNames.email}
            defaultValue={state.values.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={254}
          />
          <FormFieldError match="valueMissing">
            {t("emailRequired")}
          </FormFieldError>
          <FormFieldError match="typeMismatch">
            {t("emailInvalid")}
          </FormFieldError>
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
