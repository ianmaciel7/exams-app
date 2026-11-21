"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DropAnimation,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVerticalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { QuestionOrderingItem } from "@/components/notes-app/question/question-ordering-item";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Item } from "@/components/ui/item";
import { useQuestionOrderingFieldSet } from "@/hooks/use-question-ordering-field-set";
import { cn } from "@/lib/utils";
import type { QuestionItem } from "@/types/question";

type QuestionOrderingFieldSetProps = Omit<
  ComponentProps<typeof FieldSet>,
  "children" | "onChange"
> & {
  legend: string;
  items: QuestionItem[];
  value: string[];
  correctAnswer: string[];
  resolved: boolean;
  onValueChange: (value: string[]) => void;
};

const dropAnimationConfig: DropAnimation = {
  duration: 200,
  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0",
      },
    },
  }),
};

function QuestionOrderingFieldSet({
  legend,
  items,
  value,
  correctAnswer,
  resolved,
  onValueChange,
  className,
  ...props
}: QuestionOrderingFieldSetProps) {
  const t = useTranslations("exam");
  const {
    orderedIds,
    itemMap,
    sensors,
    activeItem,
    accessibility,
    move,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useQuestionOrderingFieldSet({
    items,
    value,
    resolved,
    onValueChange,
  });

  return (
    <FieldSet
      data-slot="question-ordering-field-set"
      {...props}
      className={cn("min-w-0 gap-3", className)}
    >
      <FieldLegend className="sr-only">{legend}</FieldLegend>
      <p className="text-xs text-muted-foreground">{t("orderingHint")}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        accessibility={accessibility}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={orderedIds}
          strategy={verticalListSortingStrategy}
          disabled={resolved}
        >
          <div className="flex flex-col gap-2">
            {orderedIds.map((id, index) => {
              const item = itemMap.get(id);
              if (!item) {
                return null;
              }

              const isCorrect = resolved && id === correctAnswer[index];

              return (
                <QuestionOrderingItem
                  key={id}
                  item={item}
                  index={index}
                  total={orderedIds.length}
                  resolved={resolved}
                  isCorrect={isCorrect}
                  onMoveUp={() => move(index, index - 1)}
                  onMoveDown={() => move(index, index + 1)}
                />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimationConfig} zIndex={1000}>
          {activeItem ? (
            <Item
              data-slot="question-ordering-drag-overlay"
              variant="outline"
              className="flex cursor-grabbing items-center justify-between gap-3 rounded-lg border-primary/40 bg-card p-3 shadow-xl ring-2 ring-primary/40 scale-[1.02] rotate-[0.5deg]"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 text-muted-foreground">
                  <GripVerticalIcon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {activeItem.text}
                </span>
              </div>
            </Item>
          ) : null}
        </DragOverlay>
      </DndContext>
    </FieldSet>
  );
}

export { QuestionOrderingFieldSet };
export type { QuestionOrderingFieldSetProps };
