"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useProfileSaveButton } from "../_hooks/use-profile-save-button";

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
  const { t, isSubmitting, isDisabled } = useProfileSaveButton();

  return (
    <Button
      {...props}
      type="submit"
      className={cn("w-full", className)}
      disabled={disabled || isDisabled}
      focusableWhenDisabled
    >
      {isSubmitting && <Spinner data-icon="inline-start" aria-hidden="true" />}
      {children ?? t(isSubmitting ? "savingProfile" : "saveProfile")}
    </Button>
  );
}

export { ProfileSaveButton };
