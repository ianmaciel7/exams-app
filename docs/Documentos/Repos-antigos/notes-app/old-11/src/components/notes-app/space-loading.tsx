"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Empty, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SpaceLoadingProps = ComponentProps<typeof Empty>;

function SpaceLoading({ className, ...props }: SpaceLoadingProps) {
  const t = useTranslations("spaces");

  return (
    <Empty
      data-slot="space-loading"
      {...props}
      className={cn(
        "flex min-h-svh w-full items-center justify-center",
        className
      )}
      data-testid="space-loading"
    >
      <EmptyMedia variant="icon">
        <Spinner className="size-8" aria-label={t("loading")} />
      </EmptyMedia>
      <EmptyDescription className="sr-only">{t("loading")}</EmptyDescription>
    </Empty>
  );
}

export { SpaceLoading, type SpaceLoadingProps };
