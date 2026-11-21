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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { QuestionItem } from "@/types/question";

export type UseQuestionOrderingFieldSetOptions = {
  items: QuestionItem[];
  value: string[];
  resolved: boolean;
  onValueChange: (value: string[]) => void;
};

function createAnnouncements(
  t: ReturnType<typeof useTranslations>,
  items: QuestionItem[],
  orderedIds: string[]
): Announcements {
  const itemText = (id: string | number) =>
    items.find((item) => item.id === id)?.text ?? String(id);
  const getPosition = (id: string | number | undefined) => {
    const idx = orderedIds.indexOf(String(id));
    return idx === -1 ? 1 : idx + 1;
  };
  return {
    onDragStart: ({ active }) =>
      t("orderingAnnouncePickup", {
        item: itemText(active.id),
        position: getPosition(active.id),
        total: orderedIds.length,
      }),
    onDragOver: ({ active, over }) =>
      t("orderingAnnounceOver", {
        item: itemText(active.id),
        position: getPosition(over?.id ?? active.id),
        total: orderedIds.length,
      }),
    onDragEnd: ({ active, over }) =>
      t("orderingAnnounceDrop", {
        item: itemText(active.id),
        position: getPosition(over?.id ?? active.id),
        total: orderedIds.length,
      }),
    onDragCancel: ({ active }) =>
      t("orderingAnnounceCancel", { item: itemText(active.id) }),
  };
}

export function useQuestionOrderingFieldSet({
  items,
  value,
  resolved,
  onValueChange,
}: UseQuestionOrderingFieldSetOptions) {
  const t = useTranslations("exam");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (value.length === 0 && items.length > 0) {
      onValueChange(items.map((i) => i.id));
    }
  }, [value, items, onValueChange]);

  const orderedIds =
    value.length === items.length ? value : items.map((i) => i.id);
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const move = (fromIndex: number, toIndex: number) => {
    if (resolved || toIndex < 0 || toIndex >= orderedIds.length) {
      return;
    }
    const next = arrayMove(orderedIds, fromIndex, toIndex);
    onValueChange(next);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id || resolved) {
      return;
    }

    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));

    if (oldIndex !== -1 && newIndex !== -1) {
      onValueChange(arrayMove(orderedIds, oldIndex, newIndex));
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = items.find((item) => item.id === activeId) ?? null;

  const announcements = createAnnouncements(t, items, orderedIds);

  return {
    orderedIds,
    itemMap,
    sensors,
    activeId,
    activeItem,
    accessibility: {
      announcements,
      screenReaderInstructions: { draggable: t("dragInstructions") },
    },
    move,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
