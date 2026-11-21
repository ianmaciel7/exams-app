"use client";

import { useDroppable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";
import { QuestionDraggableItem } from "@/components/notes-app/question/question-draggable-item";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import { QuestionSlotSelect } from "@/components/notes-app/question/question-slot-select";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { QuestionDropField, QuestionItem } from "@/types/question";

type QuestionSlotFieldProps = Omit<ComponentProps<typeof Field>, "children"> & {
  field: QuestionDropField;
  items: QuestionItem[];
  placedId: string;
  correctId: string;
  resolved: boolean;
  onPlace?: (itemId: string) => void;
};

function QuestionSlotField({
  field,
  items,
  placedId,
  correctId,
  resolved,
  onPlace,
  className,
  ...props
}: QuestionSlotFieldProps) {
  const t = useTranslations("exam");
  const selectId = useId();
  const { setNodeRef, isOver } = useDroppable({ id: field.id });
  const descId = `${selectId}-desc`;
  const placed = items.find((item) => item.id === placedId);
  const isCorrect = placedId === correctId;
  const correctText = items.find((item) => item.id === correctId)?.text;

  return (
    <Field
      data-slot="question-slot-field"
      {...props}
      className={cn("flex flex-col gap-1.5", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <FieldLabel
          htmlFor={selectId}
          className="text-xs font-semibold tracking-wide text-muted-foreground"
        >
          {field.label}
        </FieldLabel>
        <div className="flex items-center gap-2">
          {resolved ? (
            <QuestionResultBadge state={isCorrect ? "correct" : "incorrect"} />
          ) : null}
          {placed && !resolved ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onPlace?.("")}
              className="h-auto p-0 text-xs text-muted-foreground transition-colors hover:bg-transparent hover:text-destructive"
            >
              {t("dragSlotClear")}
            </Button>
          ) : null}
          <QuestionSlotSelect
            id={selectId}
            describedById={descId}
            disabled={resolved}
            items={items}
            label={field.label}
            onPlace={onPlace}
            placedId={placedId}
            showError={resolved && !isCorrect}
          />
        </div>
      </div>
      <div
        ref={setNodeRef}
        data-over={isOver || undefined}
        className={cn(
          "flex min-h-11 items-center justify-center rounded-md border border-dashed transition-all",
          placed
            ? "border-transparent bg-background shadow-xs data-[over]:border-primary data-[over]:ring-2 data-[over]:ring-primary/30"
            : "border-border/80 bg-background/40 px-3 py-2 text-xs text-muted-foreground data-[over]:border-primary data-[over]:bg-primary/10 data-[over]:ring-2 data-[over]:ring-primary/20"
        )}
      >
        {placed ? (
          <QuestionDraggableItem
            item={placed}
            disabled={resolved}
            className="w-full justify-start shadow-xs hover:border-primary/50"
          />
        ) : (
          <span
            className={cn(
              "select-none text-xs text-muted-foreground/70 transition-opacity",
              isOver && "opacity-0"
            )}
          >
            {t("dragSlotEmpty")}
          </span>
        )}
      </div>
      {resolved && !isCorrect ? (
        <FieldDescription id={descId} className="text-xs text-destructive">
          {t("correctSlotItem", { item: correctText ?? correctId })}
        </FieldDescription>
      ) : null}
    </Field>
  );
}

export { QuestionSlotField, type QuestionSlotFieldProps };
