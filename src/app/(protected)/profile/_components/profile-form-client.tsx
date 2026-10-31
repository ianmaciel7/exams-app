"use client";

import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "@/components/ui/extensions/form";
import { cn } from "@/lib/utils";
import { useProfileFormClient } from "../_hooks/use-profile-form-client";

type ProfileFormClientProps = Omit<ComponentProps<typeof Form>, "onSubmit">;

function ProfileFormClient({
  children,
  className,
  ...props
}: ProfileFormClientProps) {
  const { form, handleSubmit } = useProfileFormClient();

  return (
    <FormProvider {...form}>
      <Form
        {...props}
        data-slot="profile-form"
        validationMode="onBlur"
        className={cn("flex w-full flex-col gap-(--card-spacing)", className)}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {children}
      </Form>
    </FormProvider>
  );
}

export { ProfileFormClient };
