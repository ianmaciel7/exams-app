"use client";

import type { User } from "firebase/auth";
import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Settings,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { UserAvatar } from "@/components/notes-app/user-avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type SidebarUserMenuProps = ComponentProps<typeof SidebarMenu> & {
  user: User;
  onOpenSettings: () => void;
  onSignOut: () => void;
};

function SidebarUserMenu({
  user,
  onOpenSettings,
  onSignOut,
  className,
  ...props
}: SidebarUserMenuProps) {
  const t = useTranslations("spaces");
  const authT = useTranslations("auth");
  const settingsT = useTranslations("settings");
  const { resolvedTheme, setTheme } = useTheme();
  const userName =
    user.displayName ||
    (user.isAnonymous ? authT("anonymous") : authT("defaultUser"));
  const userIdentifier = user.displayName || user.email || userName;

  return (
    <SidebarMenu
      data-slot="sidebar-user-menu"
      {...props}
      className={cn("flex-row items-center gap-1 pr-1.5", className)}
      aria-label={t("openUserMenu")}
    >
      <SidebarMenuItem className="flex-1 min-w-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton aria-label={t("openUserMenu")}>
                <UserRound />
                <span className="min-w-0 truncate">{userIdentifier}</span>
                <ChevronsUpDown className="ml-auto text-muted-foreground" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={6}
            className="min-w-60 p-2"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0">
                <Item size="xs">
                  <ItemMedia>
                    <UserAvatar
                      displayName={userIdentifier}
                      photoUrl={user.photoURL}
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{userName}</ItemTitle>
                    {user.email && (
                      <ItemDescription>{user.email}</ItemDescription>
                    )}
                  </ItemContent>
                </Item>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-0" />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut />
                {authT("signOut")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <ButtonGroup>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onOpenSettings}
            aria-label={settingsT("settings")}
          >
            <Settings />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label={settingsT("darkMode")}
          >
            <Moon />
          </Button>
        </ButtonGroup>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export { SidebarUserMenu, type SidebarUserMenuProps };
