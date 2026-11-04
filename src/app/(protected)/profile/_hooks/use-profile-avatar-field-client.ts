import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { useSession } from "@/hooks/use-session";
import { getAvatarSource } from "../_lib/avatar";
import { useProfileAvatar } from "./use-profile-avatar";
import { useProfileFormContext } from "./use-profile-form-context";

export function useProfileAvatarFieldClient() {
  const t = useTranslations("Auth");
  const { user } = useSession();
  const { avatar, submission } = useProfileFormContext();
  const { pending } = useFormStatus();
  const { avatarPreview, fileInputRef, handleAvatarChange } = useProfileAvatar(
    avatar.file,
    avatar.pick,
  );
  const displayName = user?.displayName ?? null;
  const email = user?.email ?? null;
  const avatarSrc = getAvatarSource(
    avatarPreview,
    user?.photoURL ?? null,
    submission.savedCount,
  );
  const fallbackInitial = (
    displayName?.charAt(0) ||
    email?.charAt(0) ||
    "U"
  ).toUpperCase();

  const avatarAlt = displayName ?? t("profileTitle");
  return {
    t,
    disabled: pending,
    avatarSrc,
    avatarAlt,
    fallbackInitial,
    fileInputRef,
    handleAvatarChange,
  };
}
