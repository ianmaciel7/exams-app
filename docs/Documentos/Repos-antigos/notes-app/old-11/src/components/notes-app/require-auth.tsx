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
import { useRequireAuth } from "@/hooks/use-require-auth";

type RequireAuthProps = PropsWithChildren<{
  fallback?: ReactNode;
  redirectTo?: string;
}>;

function RequireAuth({
  children,
  fallback,
  redirectTo = "/login",
}: RequireAuthProps) {
  const t = useTranslations("spaces");
  const { user, isLoading } = useRequireAuth(redirectTo);

  if (isLoading) {
    return (
      fallback ?? (
        <Empty data-slot="require-auth" data-testid="require-auth-loading">
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

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export { RequireAuth, type RequireAuthProps };
