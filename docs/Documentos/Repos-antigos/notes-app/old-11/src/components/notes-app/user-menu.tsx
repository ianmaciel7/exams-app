"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { LanguageSelect } from "@/components/notes-app/language-select";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type UserMenuProps = ComponentProps<"div">;

function UserMenu({ className, ...props }: UserMenuProps) {
  const { user, isLoading, signOutUser } = useAuth();
  const t = useTranslations("auth");

  if (isLoading) {
    return (
      <Skeleton
        data-slot="user-menu"
        data-testid="user-menu-loading"
        {...props}
        className={cn("h-8 w-24", className)}
      />
    );
  }

  if (!user) {
    return (
      <ButtonGroup
        data-slot="user-menu"
        {...props}
        className={cn("flex items-center gap-3", className)}
      >
        <LanguageSelect />
        <Button
          render={
            <Link href="/login" data-testid="user-menu-login-link">
              {t("signIn")}
            </Link>
          }
          nativeButton={false}
          size="sm"
          variant="outline"
        />
      </ButtonGroup>
    );
  }

  const userIdentifier =
    user.displayName ||
    user.email ||
    (user.isAnonymous ? t("anonymous") : t("defaultUser"));

  return (
    <ButtonGroup
      data-slot="user-menu"
      data-testid="user-menu"
      {...props}
      className={cn(
        "flex items-center gap-3 text-sm text-foreground",
        className
      )}
    >
      <LanguageSelect />
      <span
        data-testid="user-menu-identifier"
        className="max-w-45 truncate font-medium"
      >
        {userIdentifier}
      </span>
      <Button
        data-testid="user-menu-sign-out-btn"
        size="sm"
        variant="ghost"
        onClick={() => signOutUser()}
      >
        {t("signOut")}
      </Button>
    </ButtonGroup>
  );
}

export { UserMenu, type UserMenuProps };
