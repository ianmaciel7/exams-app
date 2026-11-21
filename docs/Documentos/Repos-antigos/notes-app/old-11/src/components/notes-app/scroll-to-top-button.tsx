"use client";

import { ArrowUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScrollToTopButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "aria-label"
>;

function ScrollToTopButton({ className, ...props }: ScrollToTopButtonProps) {
  const t = useTranslations("exam");

  return (
    <Button
      data-slot="scroll-to-top-button"
      type="button"
      variant="outline"
      size="icon"
      {...props}
      aria-label={t("scrollToTop")}
      className={cn(
        "fixed right-4 bottom-4 rounded-full border border-border bg-background text-foreground shadow-md hover:bg-muted sm:right-6 sm:bottom-6",
        className
      )}
    >
      <ArrowUpIcon aria-hidden="true" />
    </Button>
  );
}

export { ScrollToTopButton, type ScrollToTopButtonProps };
