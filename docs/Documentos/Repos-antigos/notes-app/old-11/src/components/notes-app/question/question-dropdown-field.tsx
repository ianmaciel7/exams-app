"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { QuestionDropdownField as QuestionDropdownFieldType } from "@/types/question";

type QuestionDropdownFieldProps = Omit<
  ComponentProps<typeof Field>,
  "children" | "onChange"
> & {
  dropdown: QuestionDropdownFieldType;
  value: string;
  correctAnswer?: string;
  resolved: boolean;
  onValueChange: (value: string) => void;
  index?: number;
  inputId?: string;
};

function QuestionDropdownField({
  dropdown,
  value,
  correctAnswer,
  resolved,
  onValueChange,
  index,
  inputId: inputIdProp,
  className,
  ...props
}: QuestionDropdownFieldProps) {
  const t = useTranslations("exam");
  const generatedId = useId();
  const fieldId = inputIdProp ?? `${generatedId}-${dropdown.id}`;

  const isCorrect =
    resolved &&
    value !== "" &&
    correctAnswer !== undefined &&
    value === correctAnswer;
  const isIncorrect =
    resolved &&
    value !== "" &&
    correctAnswer !== undefined &&
    value !== correctAnswer;
  const incorrectStatus = isIncorrect ? "incorrect" : undefined;
  const status = isCorrect ? "correct" : incorrectStatus;

  const label =
    dropdown.label || (index !== undefined ? `${index + 1}` : dropdown.id);

  return (
    <Field
      data-slot="question-dropdown-field"
      data-status={status}
      {...props}
      className={cn(
        "rounded-lg border border-border p-3 transition-colors",
        status === "correct" && "border-primary bg-primary/10",
        status === "incorrect" && "border-destructive bg-destructive/10",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={fieldId} className="text-sm font-medium">
          {label}
        </FieldLabel>
        {status ? <QuestionResultBadge state={status} /> : null}
      </div>
      <FieldContent>
        <Select
          disabled={resolved}
          value={value}
          onValueChange={(next) => onValueChange(String(next))}
        >
          <SelectTrigger
            id={fieldId}
            className="w-full"
            data-slot="question-dropdown-trigger"
          >
            <SelectValue placeholder={t("dropdownPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {dropdown.options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldContent>
    </Field>
  );
}

export { QuestionDropdownField, type QuestionDropdownFieldProps };
