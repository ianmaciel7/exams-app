"use client";

import type { ComponentProps } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Form } from "@/components/ui/extensions/form";
import { cn } from "@/lib/utils";
import { useProfile } from "../_hooks/use-profile";
import { useProfileSubmit } from "../_hooks/use-profile-submit";
import type { ProfileFormValues } from "../_lib/definitions";
import { ProfileContext } from "../_lib/profile-context";

type ProfileFormClientProps = Omit<ComponentProps<typeof Form>, "onSubmit">;

function ProfileFormClient({
  children,
  className,
  ...props
}: ProfileFormClientProps) {
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
      form.reset({ ...savedValues, avatarFile: null });
    }
  }

  return (
    <ProfileContext value={profile}>
      <FormProvider {...form}>
        <Form
          {...props}
          data-slot="profile-form"
          validationMode="onBlur"
          className={cn("flex w-full flex-col gap-(--card-spacing)", className)}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          {saveError && (
            <p role="alert" className="text-sm text-destructive">
              {saveError}
            </p>
          )}
          {children}
        </Form>
      </FormProvider>
    </ProfileContext>
  );
}

export { ProfileFormClient };
