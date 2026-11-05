"use client";

import type { ComponentProps } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type ProfileAvatarIdentity,
  useProfileAvatarFieldClient,
} from "../_hooks/use-profile-avatar-field-client";

type ProfileAvatarFieldClientProps = ComponentProps<typeof Field> & {
  file: File | null;
  onPick: (file: File) => void;
  pending: boolean;
  savedCount: number;
  identity: ProfileAvatarIdentity;
};

function ProfileAvatarFieldClient({
  className,
  file,
  onPick,
  pending,
  savedCount,
  identity,
  ...props
}: ProfileAvatarFieldClientProps) {
  const { fileInputRef, handleAvatarChange, disabled, ...field } =
    useProfileAvatarFieldClient({
      file,
      onPick,
      pending,
      savedCount,
      identity,
    });

  return (
    <Field
      orientation="horizontal"
      aria-labelledby={field.titleId}
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
          {field.avatarSrc ? (
            <AvatarImage src={field.avatarSrc} alt={field.avatarAlt} />
          ) : null}
          <AvatarFallback className="text-xl">
            {field.fallbackInitial}
          </AvatarFallback>
        </Avatar>
      </Button>
      <FieldContent className="self-center">
        <FieldTitle id={field.titleId}>
          {field.t("profilePhotoTitle")}
        </FieldTitle>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto w-fit px-0 leading-snug"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          {field.t("profilePhotoChange")}
        </Button>
      </FieldContent>
      <Input
        ref={fileInputRef}
        type="file"
        autoComplete="off"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        tabIndex={-1}
        disabled={disabled}
        onChange={handleAvatarChange}
      />
    </Field>
  );
}

export { ProfileAvatarFieldClient };
