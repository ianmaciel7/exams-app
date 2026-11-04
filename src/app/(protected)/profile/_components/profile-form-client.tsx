"use client";

import type { ComponentProps } from "react";
import { Form } from "@/components/ui/extensions/form";
import { cn } from "@/lib/utils";
import { useProfileFormClient } from "../_hooks/use-profile-form-client";
import { ProfileFormContext } from "../_lib/profile-form-context";

type ProfileFormClientProps = Omit<
  ComponentProps<typeof Form>,
  "action" | "onSubmit"
>;

function ProfileFormClient({
  children,
  className,
  ...props
}: ProfileFormClientProps) {
  const { formAction, submission, avatar } = useProfileFormClient();

  return (
    <ProfileFormContext value={{ submission, avatar }}>
      <Form
        {...props}
        data-slot="profile-form"
        validationMode="onBlur"
        className={cn("flex w-full flex-col gap-(--card-spacing)", className)}
        action={formAction}
      >
        {submission.error && (
          <p role="alert" className="text-sm text-destructive">
            {submission.error}
          </p>
        )}
        {children}
      </Form>
    </ProfileFormContext>
  );
}

export { ProfileFormClient };
