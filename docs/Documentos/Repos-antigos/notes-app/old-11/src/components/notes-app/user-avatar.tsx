"use client";

import type { ComponentProps } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserAvatarProps = ComponentProps<typeof Avatar> & {
  displayName: string;
  photoUrl: string | null;
};

function UserAvatar({ displayName, photoUrl, ...props }: UserAvatarProps) {
  return (
    <Avatar data-slot="user-avatar" {...props} size="sm">
      {photoUrl && <AvatarImage src={photoUrl} alt="" />}
      <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

export { UserAvatar, type UserAvatarProps };
