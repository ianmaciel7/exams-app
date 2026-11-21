"use client";

import {
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { QuestionDropField, QuestionItem } from "@/types/question";

/** Droppable id of the list of items that are not in a slot. */
export const DRAG_POOL_ID = "pool";

export type UseQuestionDraggableItemGroupOptions = {
  items: QuestionItem[];
  slots: QuestionDropField[];
  /** slotId -> itemId placed so far. */
  value: Readonly<Record<string, string>>;
  onValueChange: (next: Record<string, string>) => void;
};

export function useQuestionDraggableItemGroup({
  items,
  slots,
  value,
  onValueChange,
}: UseQuestionDraggableItemGroupOptions) {
  const t = useTranslations("exam");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const placedIds = new Set(Object.values(value));
  const poolItems = items.filter((item) => !placedIds.has(item.id));

  const [activeId, setActiveId] = useState<string | null>(null);

  const itemText = (id: string | number) =>
    items.find((item) => item.id === id)?.text ?? String(id);
  const targetText = (id: string | number | undefined) =>
    slots.find((slot) => slot.id === id)?.label ?? t("dragPoolTarget");

  /** Puts an item into a slot (or back to the pool); an item sits in one place only. */
  const placeItem = (itemId: string, slotId: string | null) => {
    const next: Record<string, string> = {};
    for (const [slot, placed] of Object.entries(value)) {
      if (placed !== itemId && slot !== slotId) {
        next[slot] = placed;
      }
    }
    if (slotId !== null && itemId !== "") {
      next[slotId] = itemId;
    }
    onValueChange(next);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) {
      return;
    }
    const itemId = String(active.id);
    placeItem(itemId, over.id === DRAG_POOL_ID ? null : String(over.id));
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = items.find((item) => item.id === activeId) ?? null;

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t("dragAnnouncePickup", { item: itemText(active.id) }),
    onDragOver: ({ active, over }) =>
      t("dragAnnounceOver", {
        item: itemText(active.id),
        target: targetText(over?.id),
      }),
    onDragEnd: ({ active, over }) =>
      t("dragAnnounceDrop", {
        item: itemText(active.id),
        target: targetText(over?.id),
      }),
    onDragCancel: ({ active }) =>
      t("dragAnnounceCancel", { item: itemText(active.id) }),
  };

  return {
    sensors,
    accessibility: {
      announcements,
      screenReaderInstructions: { draggable: t("dragInstructions") },
    },
    poolItems,
    activeId,
    activeItem,
    placeItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
