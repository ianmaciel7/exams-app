"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { CaseStudyPart } from "@/types/question";

type QuestionCaseStudyFieldSetProps = ComponentProps<typeof FieldSet> & {
  item: CaseStudyPart;
  /** 1-based position among the parts. */
  position: number;
  resolved: boolean;
};

/** One sub-question of a case study. The children are its answer control. */
function QuestionCaseStudyFieldSet({
  item,
  position,
  resolved,
  children,
  className,
  ...props
}: QuestionCaseStudyFieldSetProps) {
  const t = useTranslations("exam");

  return (
    <FieldSet
      data-slot="question-case-study-field-set"
      {...props}
      className={cn(
        "min-w-0 gap-2 rounded-lg border border-border p-3",
        className
      )}
    >
      <FieldLegend variant="label">
        {t("caseStudyQuestionIndex", { current: position })}
      </FieldLegend>
      <p className="whitespace-pre-wrap text-sm text-foreground">
        {item.prompt}
      </p>
      {children}
      {resolved && item.explanation ? (
        <FieldDescription>{item.explanation}</FieldDescription>
      ) : null}
    </FieldSet>
  );
}

export { QuestionCaseStudyFieldSet, type QuestionCaseStudyFieldSetProps };
