"use client";

import type { ComponentProps } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useProfileAvatarFieldClient } from "../_hooks/use-profile-avatar-field-client";

type ProfileAvatarFieldClientProps = ComponentProps<typeof Field>;

function ProfileAvatarFieldClient({
  className,
  ...props
}: ProfileAvatarFieldClientProps) {
  const {
    t,
    disabled,
    avatarSrc,
    avatarAlt,
    fallbackInitial,
    errorMessage,
    fileInputRef,
    handleAvatarChange,
  } = useProfileAvatarFieldClient();
  const errorId = "profile-avatar-error";

  return (
    <Field
      orientation="horizontal"
      className={cn("items-center gap-4", className)}
      {...props}
    >
      <Button
        type="button"
        variant="ghost"
        className="size-16 rounded-full p-0"
        aria-label={t("profilePhotoChange")}
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className="size-16 transition-opacity group-hover/button:opacity-70">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt={avatarAlt} /> : null}
          <AvatarFallback className="text-xl">{fallbackInitial}</AvatarFallback>
        </Avatar>
      </Button>
      <FieldContent className="self-center">
        <FieldTitle>{t("profilePhotoTitle")}</FieldTitle>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto w-fit px-0 leading-snug"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          {t("profilePhotoChange")}
        </Button>
      </FieldContent>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={t("profilePhotoChange")}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? errorId : undefined}
        disabled={disabled}
        onChange={handleAvatarChange}
      />
      {errorMessage && <FieldError id={errorId}>{errorMessage}</FieldError>}
    </Field>
  );
}

export { ProfileAvatarFieldClient };
