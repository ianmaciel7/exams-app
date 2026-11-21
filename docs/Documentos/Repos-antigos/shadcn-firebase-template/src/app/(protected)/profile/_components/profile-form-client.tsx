"use client";

import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useProfileFormClient } from "../_hooks/use-profile-form-client";

type ProfileFormClientProps = Omit<ComponentProps<"form">, "onSubmit">;

function ProfileFormClient({
  children,
  className,
  ...props
}: ProfileFormClientProps) {
  const { form, handleSubmit } = useProfileFormClient();

  return (
    <FormProvider {...form}>
      <form
        {...props}
        data-slot="profile-form"
        className={cn("flex w-full flex-col gap-(--card-spacing)", className)}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  );
}

export { ProfileFormClient };
