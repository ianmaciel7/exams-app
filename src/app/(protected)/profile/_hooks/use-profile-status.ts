import { useTranslations } from "next-intl";
import type { useProfileSession } from "./use-profile-session";

export type ProfileStatus = {
  errorMessage: string;
  isError: boolean;
  isHidden: boolean;
  isLoading: boolean;
  isReady: boolean;
  userId: string | undefined;
};

export function useProfileStatus(
  session: ReturnType<typeof useProfileSession>,
): ProfileStatus {
  const t = useTranslations("Auth");
  const idle: ProfileStatus = {
    errorMessage: "",
    isError: false,
    isHidden: false,
    isLoading: false,
    isReady: false,
    userId: undefined,
  };
  const { user, error, defaultValues, authReady, preferencesReady } = session;
  if (!authReady || (user && !preferencesReady))
    return { ...idle, isLoading: true };
  if (!user && !error) return { ...idle, isHidden: true };
  if (!user || !defaultValues)
    return {
      ...idle,
      errorMessage: error ?? t("profileLoadError"),
      isError: true,
    };
  return { ...idle, isReady: true, userId: user.uid };
}
