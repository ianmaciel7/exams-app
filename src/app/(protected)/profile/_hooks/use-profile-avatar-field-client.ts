import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { useSession } from "@/hooks/use-session";
import { getAvatarFallbackInitial, getAvatarSource } from "../_lib/avatar";
import type { ProfileFormValues } from "../_lib/definitions";
import { useProfileAvatarInput } from "./use-profile-avatar-input";
import { useProfileAvatarPreview } from "./use-profile-avatar-preview";

export function useProfileAvatarFieldClient() {
  const t = useTranslations("Auth");
  const { user } = useSession();
  const { control, setValue, formState } = useFormContext<ProfileFormValues>();
  const avatarFile = useWatch({ control, name: "avatarFile" });
  const preview = useProfileAvatarPreview(avatarFile);
  const { fileInputRef, handleAvatarChange } = useProfileAvatarInput(
    avatarFile,
    (file) => setValue("avatarFile", file, { shouldDirty: true }),
  );
  const displayName = user?.displayName ?? null;

  return {
    t,
    disabled: formState.disabled || formState.isSubmitting,
    avatarSrc: getAvatarSource(
      preview,
      user?.photoURL ?? null,
      formState.submitCount,
    ),
    avatarAlt: displayName ?? t("profileTitle"),
    fallbackInitial: getAvatarFallbackInitial(displayName, user?.email ?? null),
    fileInputRef,
    handleAvatarChange,
  };
}
