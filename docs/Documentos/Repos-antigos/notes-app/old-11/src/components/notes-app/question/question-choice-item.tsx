"use client";

import type { ComponentProps } from "react";
import { QuestionImageFigure } from "@/components/notes-app/question/question-image-figure";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { QuestionOption } from "@/types/question";

type QuestionChoiceItemProps = Omit<
  ComponentProps<typeof Field>,
  "children"
> & {
  option: QuestionOption;
  /** Letter shown before the option text (A, B, ...). */
  marker: string;
  mode: "single" | "multiple";
  inputId: string;
  selected: boolean;
  disabled?: boolean;
  /** Set once graded: the key option, or a wrong pick. */
  result?: "correct" | "incorrect";
  onSelectedChange?: (selected: boolean) => void;
};

function QuestionChoiceItem({
  option,
  marker,
  mode,
  inputId,
  selected,
  disabled = false,
  result,
  onSelectedChange,
  className,
  ...props
}: QuestionChoiceItemProps) {
  // `result` is only set once graded, for the key and for a wrong pick.
  const showExplanation = result !== undefined;

  return (
    <Field
      orientation="horizontal"
      data-slot="question-choice-item"
      data-result={result}
      onClick={(e) => {
        if (disabled) {
          return;
        }
        // If user directly clicked an interactive element or the label itself, let default behavior run
        const target = e.target as HTMLElement | null;
        if (
          target?.closest("button") ||
          target?.closest("input") ||
          target?.closest("label") ||
          target?.closest("a")
        ) {
          return;
        }

        const input = document.getElementById(inputId);
        if (input) {
          input.click();
        }
      }}
      {...props}
      className={cn(
        "rounded-lg border border-border p-3 font-normal transition-colors",
        disabled
          ? "cursor-default opacity-85"
          : "cursor-pointer hover:bg-muted/50",
        "data-[result=correct]:border-primary data-[result=correct]:bg-primary/10",
        "data-[result=incorrect]:border-destructive data-[result=incorrect]:bg-destructive/10",
        "[&_[data-slot=checkbox]:not([data-checked])]:bg-background [&_[data-slot=radio-group-item]:not([data-checked])]:bg-background",
        className
      )}
    >
      {mode === "single" ? (
        <RadioGroupItem value={option.id} id={inputId} disabled={disabled} />
      ) : (
        <Checkbox
          id={inputId}
          checked={selected}
          disabled={disabled}
          onCheckedChange={(checked) => onSelectedChange?.(checked)}
        />
      )}
      <FieldContent>
        <FieldTitle className="items-start">
          <FieldLabel
            htmlFor={inputId}
            className={cn(
              "font-normal",
              disabled ? "cursor-default" : "cursor-pointer"
            )}
          >
            <span className="font-semibold">{marker}.</span>
            <span>{option.text}</span>
          </FieldLabel>
        </FieldTitle>
        {option.imageUrl ? (
          <QuestionImageFigure
            url={option.imageUrl}
            alt={option.imageAlt ?? option.text}
            className="mt-2 max-w-xs"
          />
        ) : null}
        {showExplanation && option.explanation ? (
          <FieldDescription>{option.explanation}</FieldDescription>
        ) : null}
      </FieldContent>
      {result ? <QuestionResultBadge state={result} /> : null}
    </Field>
  );
}

export { QuestionChoiceItem, type QuestionChoiceItemProps };
