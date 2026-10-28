import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { useProfileAuth } from "./use-profile-auth";
import { useProfilePreferences } from "./use-profile-preferences";

export function useProfileSession() {
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { setTheme } = useTheme();
  const auth = useProfileAuth();
  const [avatarVersion, setAvatarVersion] = useState(0);
  const { current, defaultValues, preferencesReady, savedValuesRef } =
    useProfilePreferences(auth.user?.uid, activeLocale, setTheme);

  return {
    activeLocale,
    authReady: auth.authReady,
    avatarVersion,
    defaultValues,
    error: (current?.isError ? current.error : null) ?? auth.error,
    photoURL: auth.photoURL,
    preferencesReady,
    savedValuesRef,
    setAvatarVersion,
    setPhotoURL: auth.setPhotoURL,
    setTheme,
    user: auth.user,
  };
}
