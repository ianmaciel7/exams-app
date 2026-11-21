"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { matchesAcceptedAnswer } from "@/lib/exam/evaluate-answer";
import { cn } from "@/lib/utils";

type QuestionFillBlankFieldProps = Omit<
  ComponentProps<typeof Field>,
  "children" | "onChange"
> & {
  value: string;
  /** The key, shown once graded when the typed text did not match. */
  acceptedAnswers: readonly string[];
  resolved: boolean;
  onValueChange: (value: string) => void;
};

function QuestionFillBlankField({
  value,
  acceptedAnswers,
  resolved,
  onValueChange,
  className,
  ...props
}: QuestionFillBlankFieldProps) {
  const t = useTranslations("exam");
  const inputId = useId();
  const matches = matchesAcceptedAnswer(value, acceptedAnswers);
  const descId = `${inputId}-desc`;

  return (
    <Field
      data-slot="question-fill-blank-field"
      {...props}
      className={cn("gap-2", className)}
    >
      <FieldLabel htmlFor={inputId}>{t("fillBlankLabel")}</FieldLabel>
      <FieldContent className="gap-2">
        <div className="flex items-center gap-2">
          <Input
            id={inputId}
            data-slot="question-fill-blank-input"
            type="text"
            className="flex-1"
            value={value}
            disabled={resolved}
            onChange={(e) => onValueChange(e.currentTarget.value)}
            aria-invalid={resolved && !matches}
            aria-describedby={resolved && !matches ? descId : undefined}
          />
          {resolved ? (
            <QuestionResultBadge state={matches ? "correct" : "incorrect"} />
          ) : null}
        </div>
        {resolved && !matches ? (
          <FieldDescription id={descId}>
            {t("acceptedAnswers", { answers: acceptedAnswers.join(", ") })}
          </FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  );
}

export { QuestionFillBlankField, type QuestionFillBlankFieldProps };
