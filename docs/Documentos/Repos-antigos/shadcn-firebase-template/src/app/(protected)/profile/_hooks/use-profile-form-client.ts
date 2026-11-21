import { useForm } from "react-hook-form";
import type { ProfileFormValues } from "../_lib/definitions";
import { useProfileSessionContext } from "./use-profile-session-context";
import { useProfileSubmit } from "./use-profile-submit";

export function useProfileFormClient() {
  const session = useProfileSessionContext();
  const { onSubmit } = useProfileSubmit(session);
  const form = useForm<ProfileFormValues>({
    defaultValues: { ...session.defaultValues, avatarFile: null },
    values: { ...session.defaultValues, avatarFile: null },
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

  return { form, handleSubmit };
}
