import { useTranslations } from "next-intl";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { ACCEPTED_AVATAR_TYPES, MAX_AVATAR_SIZE } from "../_lib/avatar";

export function useProfileAvatar(
  file: File | null,
  onChange: (file: File) => void,
) {
  const t = useTranslations("Auth");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [file]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (
      !ACCEPTED_AVATAR_TYPES.has(selected.type) ||
      selected.size > MAX_AVATAR_SIZE
    ) {
      setErrorMessage(t("profilePhotoInvalid"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setErrorMessage(null);
    onChange(selected);
  }

  return { avatarPreview, errorMessage, fileInputRef, handleAvatarChange };
}
