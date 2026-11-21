"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { QuestionItem } from "@/types/question";

type QuestionSlotSelectProps = Omit<
  ComponentProps<typeof NativeSelect>,
  "children" | "className" | "onChange" | "value"
> & {
  describedById: string;
  items: QuestionItem[];
  label?: string;
  onPlace?: (itemId: string) => void;
  placedId: string;
  showError: boolean;
};

function QuestionSlotSelect({
  describedById,
  items,
  label,
  onPlace,
  placedId,
  showError,
  ...props
}: QuestionSlotSelectProps) {
  const t = useTranslations("exam");

  return (
    <NativeSelect
      data-slot="question-slot-select"
      className="sr-only focus:not-sr-only focus:h-7 focus:w-auto focus:px-2 focus:py-0 focus:text-xs"
      value={placedId}
      aria-label={t("dragSlotSelectLabel", { slot: label ?? "" })}
      aria-invalid={showError}
      aria-describedby={showError ? describedById : undefined}
      onChange={(event) => onPlace?.(event.target.value)}
      {...props}
    >
      <NativeSelectOption value="">
        {t("dragSlotSelectPlaceholder")}
      </NativeSelectOption>
      {items.map((item) => (
        <NativeSelectOption key={item.id} value={item.id}>
          {item.text}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

export { QuestionSlotSelect, type QuestionSlotSelectProps };
