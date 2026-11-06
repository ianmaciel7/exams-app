import { useTranslations } from "next-intl";
import { type ChangeEvent, useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { isValidAvatarFile } from "../_lib/utils";

/** Hidden file input: validates the pick and keeps the input in sync with the form value. */
export function useProfileAvatarInput(
  file: File | null,
  onSelect: (file: File) => void,
) {
  const t = useTranslations("Auth");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file && fileInputRef.current) fileInputRef.current.value = "";
  }, [file]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!isValidAvatarFile(selected)) {
      toast.add({
        title: t("profilePhotoInvalid"),
        type: "error",
        priority: "high",
      });
      event.target.value = "";
      return;
    }
    onSelect(selected);
  }

  return { fileInputRef, handleAvatarChange };
}
