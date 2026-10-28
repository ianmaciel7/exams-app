import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { ProfileFormValues } from "../_lib/definitions";

export function useProfileSaveButton() {
  const t = useTranslations("Auth");
  const { formState } = useFormContext<ProfileFormValues>();
  const isSubmitting = formState.isSubmitting;
  return { t, isSubmitting, isDisabled: formState.disabled || isSubmitting };
}
