import { useForm } from "react-hook-form";
import type { ProfileFormValues } from "../_lib/definitions";
import { useProfile } from "./use-profile";
import { useProfileSubmit } from "./use-profile-submit";

export function useProfileFormClient() {
  const profile = useProfile();
  const { onSubmit, saveError } = useProfileSubmit(profile);
  const form = useForm<ProfileFormValues>({
    defaultValues: { ...profile.defaultValues, avatarFile: null },
    values: { ...profile.defaultValues, avatarFile: null },
    resetOptions: { keepDirtyValues: true },
  });

  async function handleSubmit(values: ProfileFormValues) {
    const savedValues = await onSubmit(values);
    if (savedValues) {
      form.reset(
        { ...savedValues, avatarFile: null },
        { keepDirtyValues: false },
      );
    }
  }

  return { form, handleSubmit, saveError, profile };
}
