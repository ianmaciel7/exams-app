import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { useAuthenticatedUser } from "../../_hooks/use-authenticated-user";
import { useProfilePreferences } from "./use-profile-preferences";

export function useProfileSession() {
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { setTheme } = useTheme();
  const user = useAuthenticatedUser();
  const [photoURL, setPhotoURL] = useState(user.photoURL ?? null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const { current, defaultValues, preferencesReady, savedValuesRef } =
    useProfilePreferences(user.uid, activeLocale, setTheme);

  return {
    activeLocale,
    avatarVersion,
    defaultValues,
    error: current?.isError ? current.error : null,
    photoURL,
    preferencesReady,
    savedValuesRef,
    setAvatarVersion,
    setPhotoURL,
    setTheme,
    user,
  };
}
