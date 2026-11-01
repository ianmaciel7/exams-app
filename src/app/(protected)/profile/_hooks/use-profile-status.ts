import { useTranslations } from "next-intl";
import type { useProfileSession } from "./use-profile-session";

export type ProfileStatus = {
  errorMessage: string;
  isError: boolean;
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
    isLoading: false,
    isReady: false,
    userId: undefined,
  };
  const { user, error, defaultValues, preferencesReady } = session;
  if (!preferencesReady) return { ...idle, isLoading: true };
  if (!defaultValues)
    return {
      ...idle,
      errorMessage: error ?? t("profileLoadError"),
      isError: true,
    };
  return { ...idle, isReady: true, userId: user.uid };
}
