"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { QuestionAnswerFieldSet } from "@/components/notes-app/question/question-answer-field-set";
import { QuestionAnswerFooter } from "@/components/notes-app/question/question-answer-footer";
import { QuestionExplanationFieldContent } from "@/components/notes-app/question/question-explanation-field-content";
import { QuestionImageFigure } from "@/components/notes-app/question/question-image-figure";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import {
  CardContent,
  CardHeader,
  Card as CardRoot,
  CardTitle,
} from "@/components/ui/card";
import { useQuestionCard } from "@/hooks/use-question-card";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/card";
import type { QuestionObject } from "@/types/object";

type QuestionCardProps = Omit<ComponentProps<typeof CardRoot>, "children"> & {
  spaceId: string;
  question: QuestionObject;
  card: Card | null;
  index: number;
  total: number;
};

function QuestionCard({
  spaceId,
  question,
  card,
  index,
  total,
  className,
  ...props
}: QuestionCardProps) {
  const t = useTranslations("exam");
  const state = useQuestionCard({ spaceId, question, card });
  const { status, isResolved } = state;
  const { properties } = question;

  return (
    <CardRoot
      data-slot="question-card"
      data-status={status}
      data-type={properties.type}
      {...props}
      className={cn("w-full pt-0", className)}
    >
      <CardHeader className="border-b border-border bg-muted/50 pt-(--card-spacing)">
        <CardTitle className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
          <span>{t("questionIndex", { current: index + 1, total })}</span>
          <span aria-live="polite">
            {status === "answeredCorrect" ? (
              <QuestionResultBadge state="correct" />
            ) : null}
            {status === "answeredIncorrect" ? (
              <QuestionResultBadge state="incorrect" />
            ) : null}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="whitespace-pre-wrap font-sans text-foreground">
          {properties.prompt}
        </p>
        {properties.promptImage ? (
          <QuestionImageFigure
            url={properties.promptImage.url}
            alt={properties.promptImage.alt}
            className="max-w-xl"
          />
        ) : null}
        {properties.type === "multiple-choice" ? (
          <p className="text-xs text-muted-foreground">{t("multipleHint")}</p>
        ) : null}
        {state.isGradable ? null : (
          <p className="text-xs text-muted-foreground">{t("revealOnly")}</p>
        )}
        <QuestionAnswerFieldSet
          question={properties}
          answer={state.answer}
          resolved={isResolved}
          onAnswerChange={state.setAnswer}
        />
        {state.hasSaveError ? (
          <p role="alert" className="text-xs text-destructive">
            {t("saveFailed")}
          </p>
        ) : null}
        {state.showExplanation && properties.explanation ? (
          <QuestionExplanationFieldContent
            explanation={properties.explanation}
          />
        ) : null}
      </CardContent>
      <QuestionAnswerFooter
        canSubmit={state.canSubmit}
        isResolved={isResolved}
        isSubmitting={state.isSubmitting}
        needsConfirmation={state.needsConfirmation}
        onRetry={state.retry}
        onShowAnswer={state.showAnswer}
        onSubmit={state.submit}
      />
    </CardRoot>
  );
}

export { QuestionCard, type QuestionCardProps };
