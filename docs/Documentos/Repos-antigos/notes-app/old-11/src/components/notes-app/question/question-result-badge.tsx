"use client";

import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type QuestionResultBadgeProps = ComponentProps<"div"> & {
  state: "correct" | "incorrect";
};

function QuestionResultBadge({
  state,
  className,
  ...props
}: QuestionResultBadgeProps) {
  const t = useTranslations("exam");

  return (
    <div
      data-slot="question-result-badge"
      data-state={state}
      {...props}
      className={cn("inline-flex", className)}
    >
      <Badge variant={state === "correct" ? "default" : "destructive"}>
        {state === "correct" ? (
          <CheckCircleIcon aria-hidden="true" data-icon="inline-start" />
        ) : (
          <XCircleIcon aria-hidden="true" data-icon="inline-start" />
        )}
        {t(state)}
      </Badge>
    </div>
  );
}

export { QuestionResultBadge, type QuestionResultBadgeProps };
