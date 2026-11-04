import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { getAvatarFallbackInitial, getAvatarSource } from "../_lib/avatar";
import type { ProfileFormValues } from "../_lib/definitions";
import { useProfileAvatarInput } from "./use-profile-avatar-input";
import { useProfileAvatarPreview } from "./use-profile-avatar-preview";
import { useProfileContext } from "./use-profile-context";

export function useProfileAvatarFieldClient() {
  const t = useTranslations("Auth");
  const { user, photoURL, avatarVersion } = useProfileContext();
  const { control, setValue, formState } = useFormContext<ProfileFormValues>();
  const avatarFile = useWatch({ control, name: "avatarFile" });
  const preview = useProfileAvatarPreview(avatarFile);
  const { fileInputRef, handleAvatarChange } = useProfileAvatarInput(
    avatarFile,
    (file) => setValue("avatarFile", file, { shouldDirty: true }),
  );
  const displayName = user.displayName ?? null;

  return {
    t,
    disabled: formState.disabled || formState.isSubmitting,
    avatarSrc: getAvatarSource(preview, photoURL, avatarVersion),
    avatarAlt: displayName ?? t("profileTitle"),
    fallbackInitial: getAvatarFallbackInitial(displayName, user.email),
    fileInputRef,
    handleAvatarChange,
  };
}
