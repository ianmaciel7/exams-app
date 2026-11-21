"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Empty, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SpacesLoadingStatusProps = ComponentProps<"div">;

function SpacesLoadingStatus({
  className,
  ...props
}: SpacesLoadingStatusProps) {
  const t = useTranslations("spaces");

  return (
    <Empty
      data-slot="spaces-loading-status"
      {...props}
      data-testid="spaces-loading-status"
      className={cn(
        "flex items-center justify-center p-4 text-xs text-muted-foreground",
        className
      )}
    >
      <EmptyMedia variant="icon">
        <Spinner />
      </EmptyMedia>
      <EmptyDescription className="sr-only">{t("loading")}</EmptyDescription>
      <Skeleton className="h-4 w-24" />
    </Empty>
  );
}

export { SpacesLoadingStatus, type SpacesLoadingStatusProps };
