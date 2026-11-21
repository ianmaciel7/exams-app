"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { useId } from "react";
import { QuestionImageFigure } from "@/components/notes-app/question/question-image-figure";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuestionItem } from "@/types/question";

type QuestionMatchingFieldProps = Omit<
  ComponentProps<typeof Field>,
  "children" | "onChange"
> & {
  item: QuestionItem;
  rightItems: QuestionItem[];
  /** The right item picked for this left item, or "" when none. */
  chosenId: string;
  correctId: string;
  resolved: boolean;
  onChosenChange: (rightId: string) => void;
};

function QuestionMatchingField({
  item,
  rightItems,
  chosenId,
  correctId,
  resolved,
  onChosenChange,
  ...props
}: QuestionMatchingFieldProps) {
  const t = useTranslations("exam");
  const selectId = useId();
  const isCorrect = chosenId === correctId;
  const correctText = rightItems.find((right) => right.id === correctId)?.text;

  const descId = `${selectId}-desc`;

  return (
    <Field
      data-slot="question-matching-field"
      orientation="responsive"
      {...props}
    >
      <FieldContent className="gap-2">
        <FieldLabel htmlFor={selectId}>{item.text}</FieldLabel>
        {item.imageUrl ? (
          <QuestionImageFigure
            url={item.imageUrl}
            alt={item.imageAlt ?? item.text}
            className="max-w-xs"
          />
        ) : null}
        {resolved && !isCorrect ? (
          <FieldDescription id={descId}>
            {t("correctMatch", { match: correctText ?? correctId })}
          </FieldDescription>
        ) : null}
      </FieldContent>
      <div className="flex items-center gap-2">
        <Select
          disabled={resolved}
          value={chosenId}
          onValueChange={(next) => onChosenChange(String(next))}
        >
          <SelectTrigger
            id={selectId}
            aria-label={t("matchLabel", { item: item.text })}
            aria-invalid={resolved && !isCorrect}
            aria-describedby={resolved && !isCorrect ? descId : undefined}
            className="w-48 sm:w-60"
            data-slot="question-matching-trigger"
          >
            <SelectValue placeholder={t("matchPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {rightItems.map((right) => (
              <SelectItem key={right.id} value={right.id}>
                {right.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {resolved ? (
          <QuestionResultBadge state={isCorrect ? "correct" : "incorrect"} />
        ) : null}
      </div>
    </Field>
  );
}

export { QuestionMatchingField, type QuestionMatchingFieldProps };
