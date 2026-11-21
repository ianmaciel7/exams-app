import type { Active, Over } from "@dnd-kit/core";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { QuestionItem } from "@/types/question";
import { useQuestionOrderingFieldSet } from "./use-question-ordering-field-set";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

const items: QuestionItem[] = [
  { id: "i1", text: "Step 1" },
  { id: "i2", text: "Step 2" },
  { id: "i3", text: "Step 3" },
];

describe("useQuestionOrderingFieldSet", () => {
  it("initializes value if empty on mount", () => {
    const onValueChange = vi.fn();
    renderHook(() =>
      useQuestionOrderingFieldSet({
        items,
        value: [],
        resolved: false,
        onValueChange,
      })
    );

    expect(onValueChange).toHaveBeenCalledWith(["i1", "i2", "i3"]);
  });

  it("moves an item using button move helpers", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionOrderingFieldSet({
        items,
        value: ["i1", "i2", "i3"],
        resolved: false,
        onValueChange,
      })
    );

    act(() => {
      result.current.move(0, 1);
    });

    expect(onValueChange).toHaveBeenCalledWith(["i2", "i1", "i3"]);
  });

  it("does not move when resolved or index is out of bounds", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionOrderingFieldSet({
        items,
        value: ["i1", "i2", "i3"],
        resolved: true,
        onValueChange,
      })
    );

    act(() => {
      result.current.move(0, 1);
    });
    expect(onValueChange).not.toHaveBeenCalled();

    const { result: activeResult } = renderHook(() =>
      useQuestionOrderingFieldSet({
        items,
        value: ["i1", "i2", "i3"],
        resolved: false,
        onValueChange,
      })
    );

    act(() => {
      activeResult.current.move(0, -1);
      activeResult.current.move(2, 3);
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("reorders on drag end", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionOrderingFieldSet({
        items,
        value: ["i1", "i2", "i3"],
        resolved: false,
        onValueChange,
      })
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "i1" } as Active,
        over: { id: "i3" } as Over,
        activatorEvent: new MouseEvent("mouseup"),
        collisions: null,
        delta: { x: 0, y: 0 },
      });
    });

    expect(onValueChange).toHaveBeenCalledWith(["i2", "i3", "i1"]);
  });

  it("tracks activeItem across drag start, cancel, and end", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionOrderingFieldSet({
        items,
        value: ["i1", "i2", "i3"],
        resolved: false,
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

  it("provides screen reader announcements for ordering", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useQuestionOrderingFieldSet({
        items,
        value: ["i1", "i2", "i3"],
        resolved: false,
        onValueChange,
      })
    );

    const { announcements } = result.current.accessibility;

    const startMsg = announcements.onDragStart?.({
      active: { id: "i1" } as Active,
    });
    expect(startMsg).toContain("orderingAnnouncePickup");
    expect(startMsg).toContain("Step 1");

    const overMsg = announcements.onDragOver?.({
      active: { id: "i1" } as Active,
      over: { id: "i2" } as Over,
    });
    expect(overMsg).toContain("orderingAnnounceOver");

    const dropMsg = announcements.onDragEnd?.({
      active: { id: "i1" } as Active,
      over: { id: "i3" } as Over,
    });
    expect(dropMsg).toContain("orderingAnnounceDrop");

    const cancelMsg = announcements.onDragCancel?.({
      active: { id: "i1" } as Active,
      over: null as unknown as Over,
    });
    expect(cancelMsg).toContain("orderingAnnounceCancel");
  });
});
