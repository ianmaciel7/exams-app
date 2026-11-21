"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVerticalIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { QuestionImageFigure } from "@/components/notes-app/question/question-image-figure";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuestionItem } from "@/types/question";

type QuestionDraggableItemProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "id" | "onClick"
> & {
  item: QuestionItem;
};

/** A chip the learner can drag with a pointer or move with the keyboard. */
function QuestionDraggableItem({
  item,
  disabled,
  className,
  ...props
}: QuestionDraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id, disabled });

  return (
    <Button
      data-slot="question-draggable-item"
      data-dragging={isDragging || undefined}
      type="button"
      variant="outline"
      disabled={disabled}
      {...props}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      aria-disabled={disabled || undefined}
      style={
        !isDragging && transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={cn(
        "relative h-auto min-h-8 touch-none justify-start gap-2 whitespace-normal py-1.5 text-left font-normal transition-all",
        isDragging &&
          "pointer-events-none border-dashed border-primary/40 bg-muted/20 opacity-35 shadow-none",
        className
      )}
    >
      {disabled ? null : <GripVerticalIcon aria-hidden="true" />}
      <span>{item.text}</span>
      {item.imageUrl ? (
        <QuestionImageFigure
          url={item.imageUrl}
          alt={item.imageAlt ?? item.text}
          className="w-24"
        />
      ) : null}
    </Button>
  );
}

export { QuestionDraggableItem, type QuestionDraggableItemProps };
