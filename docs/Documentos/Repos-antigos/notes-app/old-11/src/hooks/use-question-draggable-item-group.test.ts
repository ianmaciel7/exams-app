import type { Active, Over } from "@dnd-kit/core";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { QuestionDropField, QuestionItem } from "@/types/question";
import {
  DRAG_POOL_ID,
  useQuestionDraggableItemGroup,
} from "./use-question-draggable-item-group";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

const items: QuestionItem[] = [
  { id: "i1", text: "Cloud Run" },
  { id: "i2", text: "Cloud Functions" },
  { id: "i3", text: "Compute Engine" },
];

const slots: QuestionDropField[] = [
  { id: "s1", label: "Serverless Container" },
  { id: "s2", label: "Event-driven Functions" },
];

describe("useQuestionDraggableItemGroup", () => {
  it("filters poolItems to only unassigned items", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: { s1: "i1" },
        onValueChange,
      })
    );

    expect(result.current.poolItems).toEqual([items[1], items[2]]);
  });

  it("places an item into an empty slot", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: {},
        onValueChange,
      })
    );

    act(() => {
      result.current.placeItem("i1", "s1");
    });

    expect(onValueChange).toHaveBeenCalledWith({ s1: "i1" });
  });

  it("moves an item from one slot to another and evicts previous placement", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: { s1: "i1", s2: "i2" },
        onValueChange,
      })
    );

    act(() => {
      result.current.placeItem("i1", "s2");
    });

    expect(onValueChange).toHaveBeenCalledWith({ s2: "i1" });
  });

  it("clears a slot when slotId is null or itemId is empty string", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: { s1: "i1", s2: "i2" },
        onValueChange,
      })
    );

    act(() => {
      result.current.placeItem("i1", null);
    });

    expect(onValueChange).toHaveBeenCalledWith({ s2: "i2" });
  });

  it("handles drag end over a valid slot", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: {},
        onValueChange,
      })
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "i2" } as Active,
        over: { id: "s2" } as Over,
        activatorEvent: new MouseEvent("mouseup"),
        collisions: null,
        delta: { x: 0, y: 0 },
      });
    });

    expect(onValueChange).toHaveBeenCalledWith({ s2: "i2" });
  });

  it("handles drag end over the pool by unassigning the item", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: { s1: "i1" },
        onValueChange,
      })
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "i1" } as Active,
        over: { id: DRAG_POOL_ID } as Over,
        activatorEvent: new MouseEvent("mouseup"),
        collisions: null,
        delta: { x: 0, y: 0 },
      });
    });

    expect(onValueChange).toHaveBeenCalledWith({});
  });

  it("ignores drag end when over is null", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: { s1: "i1" },
        onValueChange,
      })
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "i1" } as Active,
        over: null,
        activatorEvent: new MouseEvent("mouseup"),
        collisions: null,
        delta: { x: 0, y: 0 },
      });
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("provides localized announcements for screen readers", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: {},
        onValueChange,
      })
    );

    const { announcements, screenReaderInstructions } =
      result.current.accessibility;
    expect(screenReaderInstructions.draggable).toBe("dragInstructions");

    const startMsg = announcements.onDragStart?.({
      active: { id: "i1" } as Active,
    });
    expect(startMsg).toContain("dragAnnouncePickup");
    expect(startMsg).toContain("Cloud Run");

    const overMsg = announcements.onDragOver?.({
      active: { id: "i1" } as Active,
      over: { id: "s1" } as Over,
    });
    expect(overMsg).toContain("dragAnnounceOver");
    expect(overMsg).toContain("Serverless Container");

    const dropMsg = announcements.onDragEnd?.({
      active: { id: "i1" } as Active,
      over: { id: "s1" } as Over,
    });
    expect(dropMsg).toContain("dragAnnounceDrop");

    const cancelMsg = announcements.onDragCancel?.({
      active: { id: "i1" } as Active,
      over: null as unknown as Over,
    });
    expect(cancelMsg).toContain("dragAnnounceCancel");
  });

  it("manages activeItem state across drag start, end and cancel", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionDraggableItemGroup({
        items,
        slots,
        value: {},
        onValueChange,
      })
    );

    expect(result.current.activeId).toBeNull();
    expect(result.current.activeItem).toBeNull();

    act(() => {
      result.current.handleDragStart({
        active: { id: "i2" } as Active,
      } as Parameters<typeof result.current.handleDragStart>[0]);
    });

    expect(result.current.activeId).toBe("i2");
    expect(result.current.activeItem).toEqual(items[1]);

    act(() => {
      result.current.handleDragCancel();
    });

    expect(result.current.activeId).toBeNull();
    expect(result.current.activeItem).toBeNull();
  });
});
