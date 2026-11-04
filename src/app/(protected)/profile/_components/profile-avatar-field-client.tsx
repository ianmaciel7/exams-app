"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldTitle } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useProfileAvatar } from "../_hooks/use-profile-avatar";
import { useProfileContext } from "../_hooks/use-profile-context";
import { getAvatarSource } from "../_lib/avatar";
import type { ProfileFormValues } from "../_lib/definitions";

type ProfileAvatarFieldClientProps = ComponentProps<typeof Field>;

function ProfileAvatarFieldClient({
  className,
  ...props
}: ProfileAvatarFieldClientProps) {
  const t = useTranslations("Auth");
  const titleId = useId();
  const { user, photoURL, avatarVersion } = useProfileContext();
  const { control, setValue, formState } = useFormContext<ProfileFormValues>();
  const avatarFile = useWatch({ control, name: "avatarFile" });
  const { avatarPreview, fileInputRef, handleAvatarChange } = useProfileAvatar(
    avatarFile,
    (file) => setValue("avatarFile", file, { shouldDirty: true }),
  );

  const disabled = formState.disabled || formState.isSubmitting;
  const avatarSrc = getAvatarSource(avatarPreview, photoURL, avatarVersion);
  const fallbackInitial = (
    user.displayName?.charAt(0) ||
    user.email?.charAt(0) ||
    "U"
  ).toUpperCase();
  const avatarAlt = user.displayName ?? t("profileTitle");

  return (
    <Field
      orientation="horizontal"
      aria-labelledby={titleId}
      className={cn("items-center gap-4", className)}
      {...props}
    >
      <Button
        type="button"
        variant="ghost"
        className="size-16 rounded-full p-0"
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className="size-16 transition-opacity group-hover/button:opacity-70">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt={avatarAlt} /> : null}
          <AvatarFallback className="text-xl">{fallbackInitial}</AvatarFallback>
        </Avatar>
      </Button>
      <FieldContent className="self-center">
        <FieldTitle id={titleId}>{t("profilePhotoTitle")}</FieldTitle>
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
        hidden
        tabIndex={-1}
        disabled={disabled}
        onChange={handleAvatarChange}
      />
    </Field>
  );
}

export { ProfileAvatarFieldClient };
