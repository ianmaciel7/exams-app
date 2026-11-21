"use client";

import {
  DragOverlay,
  type DropAnimation,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { GripVerticalIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { QuestionImageFigure } from "@/components/notes-app/question/question-image-figure";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuestionItem } from "@/types/question";

type QuestionDragOverlayProps = Omit<
  ComponentProps<typeof Button>,
  "children"
> & {
  item: QuestionItem | null;
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

/** A floating drag overlay representation of the currently dragged item. */
function QuestionDragOverlay({
  item,
  className,
  ...props
}: QuestionDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={dropAnimationConfig} zIndex={1000}>
      {item ? (
        <Button
          data-slot="question-drag-overlay"
          type="button"
          variant="outline"
          {...props}
          className={cn(
            "relative h-auto min-h-8 cursor-grabbing touch-none justify-start gap-2 whitespace-normal bg-card py-1.5 text-left font-normal shadow-xl ring-2 ring-primary/40 scale-[1.02] rotate-[0.5deg]",
            className
          )}
        >
          <GripVerticalIcon aria-hidden="true" />
          <span>{item.text}</span>
          {item.imageUrl ? (
            <QuestionImageFigure
              url={item.imageUrl}
              alt={item.imageAlt ?? item.text}
              className="w-24"
            />
          ) : null}
        </Button>
      ) : null}
    </DragOverlay>
  );
}

export { QuestionDragOverlay, type QuestionDragOverlayProps };
