"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

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
  const { pending: isSubmitting } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      className={cn("w-full", className)}
      disabled={disabled || isSubmitting}
      focusableWhenDisabled
    >
      {isSubmitting && <Spinner data-icon="inline-start" aria-hidden="true" />}
      {children ?? t(isSubmitting ? "savingProfile" : "saveProfile")}
    </Button>
  );
}

export { ProfileSaveButton };
