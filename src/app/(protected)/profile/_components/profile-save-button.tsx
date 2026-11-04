"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ProfileFormValues } from "../_lib/definitions";

type ProfileSaveButtonProps = Omit<
  ComponentProps<typeof Button>,
  "type" | "onClick"
>;

function ProfileSaveButton({
  className,
  disabled,
  children,
  ...props
}: ProfileSaveButtonProps) {
  const t = useTranslations("Auth");
  const { formState } = useFormContext<ProfileFormValues>();
  const isSubmitting = formState.isSubmitting;

  return (
    <Button
      {...props}
      type="submit"
      className={cn("w-full", className)}
      disabled={disabled || formState.disabled || isSubmitting}
      focusableWhenDisabled
    >
      {isSubmitting && <Spinner data-icon="inline-start" aria-hidden="true" />}
      {children ?? t(isSubmitting ? "savingProfile" : "saveProfile")}
    </Button>
  );
}

export { ProfileSaveButton };
