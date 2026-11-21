"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDownIcon, ArrowUpIcon, GripVerticalIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import { Button } from "@/components/ui/button";
import { Item } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { QuestionItem } from "@/types/question";

type QuestionOrderingItemProps = Omit<
  ComponentProps<typeof Item>,
  "children"
> & {
  item: QuestionItem;
  index: number;
  total: number;
  resolved: boolean;
  isCorrect?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function QuestionOrderingItem({
  item,
  index,
  total,
  resolved,
  isCorrect,
  onMoveUp,
  onMoveDown,
  className,
  ...props
}: QuestionOrderingItemProps) {
  const resolvedStatus = isCorrect ? "correct" : "incorrect";
  const status = resolved ? resolvedStatus : undefined;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: resolved,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <Item
      ref={setNodeRef}
      style={style}
      data-slot="question-ordering-item"
      data-status={status}
      data-dragging={isDragging || undefined}
      variant="outline"
      {...props}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border-border bg-card p-3 shadow-xs transition-colors",
        status === "correct" && "border-primary bg-primary/10",
        status === "incorrect" && "border-destructive bg-destructive/10",
        isDragging &&
          "border-dashed border-primary/40 bg-muted/20 opacity-30 shadow-none",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {!resolved ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="cursor-grab touch-none p-1 text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
            aria-label={`Drag ${item.text}`}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
        <span className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-foreground">{item.text}</span>
      </div>

      <div className="flex items-center gap-1">
        {status ? <QuestionResultBadge state={status} /> : null}

        {!resolved ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={index === 0}
              onClick={onMoveUp}
              aria-label={`Move ${item.text} up`}
            >
              <ArrowUpIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={index === total - 1}
              onClick={onMoveDown}
              aria-label={`Move ${item.text} down`}
            >
              <ArrowDownIcon className="size-4" />
            </Button>
          </>
        ) : null}
      </div>
    </Item>
  );
}

export { QuestionOrderingItem, type QuestionOrderingItemProps };
