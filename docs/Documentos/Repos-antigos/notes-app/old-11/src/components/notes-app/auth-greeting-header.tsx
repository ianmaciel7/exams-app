"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type AuthGreetingHeaderProps = ComponentProps<"div">;

function AuthGreetingHeader({ className, ...props }: AuthGreetingHeaderProps) {
  const { user } = useAuth();
  const t = useTranslations("auth");

  const userName =
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : t("defaultUser"));

  return (
    <Item
      data-slot="auth-greeting-header"
      {...props}
      className={cn("flex flex-col gap-2", className)}
    >
      <ItemContent>
        <ItemTitle className="text-2xl font-bold tracking-tight text-foreground">
          <h1>
            {user ? t("userGreeting", { name: userName }) : t("guestGreeting")}
          </h1>
        </ItemTitle>
        <ItemDescription className="text-sm text-muted-foreground">
          {user ? t("userDescription") : t("guestDescription")}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}

export { AuthGreetingHeader, type AuthGreetingHeaderProps };
