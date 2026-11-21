import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { getAvatarSource } from "../_lib/avatar";
import type { ProfileFormValues } from "../_lib/definitions";
import { useProfileAvatar } from "./use-profile-avatar";
import { useProfileSessionContext } from "./use-profile-session-context";

export function useProfileAvatarFieldClient() {
  const t = useTranslations("Auth");
  const { user, photoURL, avatarVersion } = useProfileSessionContext();
  const { control, setValue, formState } = useFormContext<ProfileFormValues>();
  const avatarFile = useWatch({ control, name: "avatarFile" });
  const { avatarPreview, fileInputRef, handleAvatarChange } = useProfileAvatar(
    avatarFile,
    (file) => setValue("avatarFile", file, { shouldDirty: true }),
  );
  const displayName = user?.displayName ?? null;
  const email = user?.email ?? null;
  const disabled = formState.disabled || formState.isSubmitting;
  const avatarSrc = getAvatarSource(avatarPreview, photoURL, avatarVersion);
  const fallbackInitial = (
    displayName?.charAt(0) ||
    email?.charAt(0) ||
    "U"
  ).toUpperCase();

  const avatarAlt = displayName ?? t("profileTitle");
  return {
    t,
    disabled,
    avatarSrc,
    avatarAlt,
    fallbackInitial,
    fileInputRef,
    handleAvatarChange,
  };
}
