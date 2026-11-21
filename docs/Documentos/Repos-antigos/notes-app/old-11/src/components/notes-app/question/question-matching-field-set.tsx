"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { QuestionMatchingField } from "@/components/notes-app/question/question-matching-field";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { QuestionItem } from "@/types/question";

type QuestionMatchingFieldSetProps = Omit<
  ComponentProps<typeof FieldSet>,
  "children" | "onChange"
> & {
  legend: string;
  leftItems: QuestionItem[];
  rightItems: QuestionItem[];
  /** leftId -> rightId chosen so far. */
  value: Readonly<Record<string, string>>;
  /** leftId -> rightId key, used to mark pairs once `resolved`. */
  correctAnswer: Readonly<Record<string, string>>;
  resolved: boolean;
  onValueChange: (next: Record<string, string>) => void;
};

function QuestionMatchingFieldSet({
  legend,
  leftItems,
  rightItems,
  value,
  correctAnswer,
  resolved,
  onValueChange,
  className,
  ...props
}: QuestionMatchingFieldSetProps) {
  const t = useTranslations("exam");

  return (
    <FieldSet
      data-slot="question-matching-field-set"
      {...props}
      className={cn("min-w-0 gap-3", className)}
    >
      <FieldLegend className="sr-only">{legend}</FieldLegend>
      <p className="text-xs text-muted-foreground">{t("matchingHint")}</p>
      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {leftItems.map((item) => (
          <div key={item.id} className="p-3">
            <QuestionMatchingField
              item={item}
              rightItems={rightItems}
              chosenId={value[item.id] ?? ""}
              correctId={correctAnswer[item.id] ?? ""}
              resolved={resolved}
              onChosenChange={(rightId) =>
                onValueChange({ ...value, [item.id]: rightId })
              }
            />
          </div>
        ))}
      </div>
    </FieldSet>
  );
}

export { QuestionMatchingFieldSet, type QuestionMatchingFieldSetProps };
