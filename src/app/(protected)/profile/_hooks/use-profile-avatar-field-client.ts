import { useTranslations } from "next-intl";
import { getAvatarFallbackInitial, getAvatarSource } from "../_lib/utils";
import { useProfileAvatarInput } from "./use-profile-avatar-input";
import { useProfileAvatarPreview } from "./use-profile-avatar-preview";

/** What the avatar shows for the person: stored photo, name and e-mail. */
export type ProfileAvatarIdentity = {
  photoURL: string | null;
  displayName: string;
  email: string;
};

type UseProfileAvatarFieldClientOptions = {
  file: File | null;
  onPick: (file: File) => void;
  pending: boolean;
  savedCount: number;
  identity: ProfileAvatarIdentity;
};

export function useProfileAvatarFieldClient({
  file,
  onPick,
  pending,
  savedCount,
  identity: { photoURL, displayName, email },
}: UseProfileAvatarFieldClientOptions) {
  const t = useTranslations("Auth");
  const preview = useProfileAvatarPreview(file);
  const { fileInputRef, handleAvatarChange } = useProfileAvatarInput(
    file,
    onPick,
  );

  return {
    t,
    disabled: pending,
    avatarSrc: getAvatarSource(preview, photoURL, savedCount),
    avatarAlt: displayName || t("profileTitle"),
    fallbackInitial: getAvatarFallbackInitial(displayName || null, email),
    fileInputRef,
    handleAvatarChange,
  };
}
