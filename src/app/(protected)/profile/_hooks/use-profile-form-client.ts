import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import type { ProfileFormValues } from "../_lib/definitions";
import { useProfilePreferences } from "./use-profile-preferences";
import { useProfileSubmit } from "./use-profile-submit";

export function useProfileFormClient() {
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { setTheme } = useTheme();
  const { user } = useSession();
  if (!user) throw new Error("Protected components require AuthGuardClient");

  const { defaultValues, savedValuesRef } = useProfilePreferences(
    user.uid,
    activeLocale,
    setTheme,
  );
  const { onSubmit, saveError } = useProfileSubmit({
    activeLocale,
    savedValuesRef,
    setTheme,
    user,
  });
  const form = useForm<ProfileFormValues>({
    defaultValues: { ...defaultValues, avatarFile: null },
    values: { ...defaultValues, avatarFile: null },
    resetOptions: { keepDirtyValues: true },
  });

  async function handleSubmit(values: ProfileFormValues) {
    const savedValues = await onSubmit(values);
    if (savedValues) {
      form.reset(
        { ...savedValues, avatarFile: null },
        { keepDirtyValues: false },
      );
    }
  }

  return { form, handleSubmit, saveError };
}
