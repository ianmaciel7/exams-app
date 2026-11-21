"use client";

import { type ComponentProps, useId } from "react";
import { QuestionChoiceItem } from "@/components/notes-app/question/question-choice-item";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { QuestionOption } from "@/types/question";

type QuestionChoiceFieldSetProps = Omit<
  ComponentProps<typeof FieldSet>,
  "children" | "onChange"
> & {
  /** Accessible name of the group (the prompt). */
  legend: string;
  /** `single` renders radio buttons, `multiple` renders checkboxes. */
  mode: "single" | "multiple";
  options: QuestionOption[];
  value: readonly string[];
  /** The key, used to mark options once `resolved`. */
  correctIds: readonly string[];
  resolved: boolean;
  onValueChange: (ids: string[]) => void;
};

function resultFor(
  resolved: boolean,
  selected: boolean,
  isKey: boolean
): "correct" | "incorrect" | undefined {
  if (!resolved) {
    return undefined;
  }
  if (isKey) {
    return "correct";
  }
  return selected ? "incorrect" : undefined;
}

function QuestionChoiceFieldSet({
  legend,
  mode,
  options,
  value,
  correctIds,
  resolved,
  onValueChange,
  className,
  ...props
}: QuestionChoiceFieldSetProps) {
  const groupId = useId();

  const items = options.map((option, index) => {
    const selected = value.includes(option.id);
    return (
      <QuestionChoiceItem
        key={option.id}
        option={option}
        marker={String.fromCharCode(65 + index)}
        mode={mode}
        inputId={`${groupId}-${option.id}`}
        selected={selected}
        disabled={resolved}
        result={resultFor(resolved, selected, correctIds.includes(option.id))}
        onSelectedChange={(checked) =>
          onValueChange(
            checked
              ? [...value, option.id]
              : value.filter((id) => id !== option.id)
          )
        }
      />
    );
  });

  return (
    <FieldSet
      data-slot="question-choice-field-set"
      {...props}
      className={cn("min-w-0 gap-2", className)}
    >
      <FieldLegend className="sr-only">{legend}</FieldLegend>
      {mode === "single" ? (
        <RadioGroup
          value={value[0] ?? ""}
          disabled={resolved}
          onValueChange={(next) => onValueChange([String(next)])}
        >
          {items}
        </RadioGroup>
      ) : (
        <FieldGroup className="gap-2">{items}</FieldGroup>
      )}
    </FieldSet>
  );
}

export { QuestionChoiceFieldSet, type QuestionChoiceFieldSetProps };
