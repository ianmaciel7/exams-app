"use client";

import { useTranslations } from "next-intl";
import type { PropsWithChildren, ReactNode } from "react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useRequireGuest } from "@/hooks/use-require-guest";

type RequireGuestProps = PropsWithChildren<{
  fallback?: ReactNode;
  redirectTo?: string;
}>;

function RequireGuest({
  children,
  fallback,
  redirectTo = "/",
}: RequireGuestProps) {
  const t = useTranslations("spaces");
  const { user, isLoading } = useRequireGuest(redirectTo);

  if (isLoading) {
    return (
      fallback ?? (
        <Empty data-slot="require-guest" data-testid="require-guest-loading">
          <EmptyHeader>
            <EmptyMedia>
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>{t("loading")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}

export { RequireGuest, type RequireGuestProps };
