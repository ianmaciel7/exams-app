import { useTranslations } from "next-intl";
import { useSession } from "@/hooks/use-session";
import { getAvatarFallbackInitial, getAvatarSource } from "../_lib/utils";
import { useProfileAvatarInput } from "./use-profile-avatar-input";
import { useProfileAvatarPreview } from "./use-profile-avatar-preview";

type UseProfileAvatarFieldClientOptions = {
  file: File | null;
  onPick: (file: File) => void;
  pending: boolean;
  savedCount: number;
};

export function useProfileAvatarFieldClient({
  file,
  onPick,
  pending,
  savedCount,
}: UseProfileAvatarFieldClientOptions) {
  const t = useTranslations("Auth");
  const { user } = useSession();
  const preview = useProfileAvatarPreview(file);
  const { fileInputRef, handleAvatarChange } = useProfileAvatarInput(
    file,
    onPick,
  );
  const displayName = user?.displayName ?? null;

  return {
    t,
    disabled: pending,
    avatarSrc: getAvatarSource(preview, user?.photoURL ?? null, savedCount),
    avatarAlt: displayName ?? t("profileTitle"),
    fallbackInitial: getAvatarFallbackInitial(displayName, user?.email ?? null),
    fileInputRef,
    handleAvatarChange,
  };
}
