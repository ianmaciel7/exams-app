"use client";

import { Folder, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type SpacesEmptyProps = ComponentProps<"div"> & {
  onCreate: () => void;
};

function SpacesEmpty({ onCreate, className, ...props }: SpacesEmptyProps) {
  const t = useTranslations("spaces");
  return (
    <Empty
      data-slot="spaces-empty"
      data-testid="spaces-empty"
      {...props}
      className={cn("flex flex-1 items-center justify-center p-8", className)}
    >
      <Empty className="w-full max-w-lg grow-0 border border-dashed p-8 md:p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder />
          </EmptyMedia>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            size="sm"
            onClick={onCreate}
            data-testid="spaces-empty-create-btn"
          >
            <Plus data-icon="inline-start" />
            {t("createFirstSpace")}
          </Button>
        </EmptyContent>
      </Empty>
    </Empty>
  );
}

export { SpacesEmpty, type SpacesEmptyProps };
