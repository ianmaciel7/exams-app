"use client";

import { RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QuestionAnswerFooterProps = ComponentProps<typeof CardFooter> & {
  canSubmit?: boolean;
  isResolved?: boolean;
  isSubmitting?: boolean;
  needsConfirmation?: boolean;
  onRetry?: () => void;
  onShowAnswer?: () => void;
  onSubmit?: () => void;
};

/**
 * Footer actions of a question card. Children replace the default actions,
 * so a caller can compose its own buttons inside the same footer.
 */
function QuestionAnswerFooter({
  canSubmit = true,
  children,
  isResolved = false,
  isSubmitting = false,
  needsConfirmation = false,
  onRetry,
  onShowAnswer,
  onSubmit,
  className,
  ...props
}: QuestionAnswerFooterProps) {
  const t = useTranslations("exam");

  let actions: ReactNode = children;
  if (!children) {
    actions = isResolved ? (
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
        {t("tryAgain")}
      </Button>
    ) : (
      <>
        {needsConfirmation ? (
          <Button
            type="button"
            size="sm"
            disabled={!canSubmit || isSubmitting}
            onClick={onSubmit}
          >
            {t("checkAnswer")}
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" onClick={onShowAnswer}>
          {t("showAnswer")}
        </Button>
      </>
    );
  }

  return (
    <CardFooter
      data-slot="question-answer-footer"
      {...props}
      className={cn("gap-2", className)}
    >
      {actions}
    </CardFooter>
  );
}

export { QuestionAnswerFooter, type QuestionAnswerFooterProps };
