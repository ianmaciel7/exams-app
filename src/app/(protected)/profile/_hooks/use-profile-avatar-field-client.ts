import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { useSession } from "@/hooks/use-session";
import { getAvatarFallbackInitial, getAvatarSource } from "../_lib/avatar";
import { useProfileAvatarInput } from "./use-profile-avatar-input";
import { useProfileAvatarPreview } from "./use-profile-avatar-preview";
import { useProfileFormContext } from "./use-profile-form-context";

export function useProfileAvatarFieldClient() {
  const t = useTranslations("Auth");
  const { user } = useSession();
  const { avatar, submission } = useProfileFormContext();
  const { pending } = useFormStatus();
  const preview = useProfileAvatarPreview(avatar.file);
  const { fileInputRef, handleAvatarChange } = useProfileAvatarInput(
    avatar.file,
    avatar.pick,
  );
  const displayName = user?.displayName ?? null;

  return {
    t,
    disabled: pending,
    avatarSrc: getAvatarSource(
      preview,
      user?.photoURL ?? null,
      submission.savedCount,
    ),
    avatarAlt: displayName ?? t("profileTitle"),
    fallbackInitial: getAvatarFallbackInitial(displayName, user?.email ?? null),
    fileInputRef,
    handleAvatarChange,
  };
}
