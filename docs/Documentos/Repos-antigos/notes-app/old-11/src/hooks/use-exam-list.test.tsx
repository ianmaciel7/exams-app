import { act, renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/lib/auth-context";
import { SCROLL_TO_TOP_THRESHOLD, useExamList } from "./use-exam-list";

type SnapshotHandlers = {
  next: (snapshot: { docs: { id: string; data: () => unknown }[] }) => void;
  error: (error: Error) => void;
  unsubscribe: ReturnType<typeof vi.fn>;
  path: string;
};

const subscriptions: SnapshotHandlers[] = [];
const mockWhere = vi.fn((...args: unknown[]) => ({ where: args }));
const mockOrderBy = vi.fn((...args: unknown[]) => ({ orderBy: args }));

vi.mock("firebase/firestore", () => ({
  collection: (_db: unknown, ...path: string[]) => ({ path: path.join("/") }),
  query: (ref: { path: string }) => ref,
  where: (...args: unknown[]) => mockWhere(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  onSnapshot: (
    ref: { path: string },
    next: SnapshotHandlers["next"],
    error: SnapshotHandlers["error"]
  ) => {
    const unsubscribe = vi.fn();
    subscriptions.push({ next, error, unsubscribe, path: ref.path });
    return unsubscribe;
  },
}));

vi.mock("@/lib/firebase/firestore", () => ({ db: { type: "mock-db" } }));

function wrapperFor(uid: string | null) {
  return ({ children }: { children: ReactNode }) => (
    <AuthContext
      value={{
        user: uid ? ({ uid } as User) : null,
        isLoading: false,
        signOutUser: async () => {},
      }}
    >
      {children}
    </AuthContext>
  );
}

const bySuffix = (suffix: string) =>
  subscriptions.find((s) => s.path.endsWith(suffix)) as SnapshotHandlers;

describe("useExamList", () => {
  beforeEach(() => {
    subscriptions.length = 0;
    vi.clearAllMocks();
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("does not subscribe without a user", () => {
    const { result } = renderHook(
      () => useExamList({ spaceId: "s1", examId: "e1" }),
      { wrapper: wrapperFor(null) }
    );
    expect(subscriptions).toHaveLength(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.questions).toEqual([]);
  });

  it("queries ordered questions of the exam and maps cards by question", () => {
    const { result } = renderHook(
      () => useExamList({ spaceId: "s1", examId: "e1" }),
      { wrapper: wrapperFor("u1") }
    );

    expect(result.current.loading).toBe(true);
    expect(mockWhere).toHaveBeenCalledWith("objectTypeId", "==", "question");
    expect(mockWhere).toHaveBeenCalledWith("properties.examId", "==", "e1");
    expect(mockOrderBy).toHaveBeenCalledWith("properties.orderIndex", "asc");

    act(() => {
      bySuffix("/objects").next({
        docs: [{ id: "q1", data: () => ({ title: "Q1" }) }],
      });
      bySuffix("/cards").next({
        docs: [{ id: "c1", data: () => ({ questionId: "q1" }) }],
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.questions[0]).toMatchObject({
      id: "q1",
      title: "Q1",
    });
    expect(result.current.cardsByQuestionId.get("q1")?.id).toBe("c1");
  });

  it("converts legacy-shaped questions on read and skips unconvertible ones", () => {
    const { result } = renderHook(
      () => useExamList({ spaceId: "s1", examId: "e1" }),
      { wrapper: wrapperFor("u1") }
    );
    const legacy = {
      statement: "Which one?",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctOptionIds: ["b"],
      examId: "e1",
      orderIndex: 0,
      format: "single_choice",
    };

    act(() => {
      bySuffix("/objects").next({
        docs: [
          { id: "q1", data: () => ({ title: "Q1", properties: legacy }) },
          {
            id: "q2",
            data: () => ({
              title: "Q2",
              properties: { ...legacy, correctOptionIds: [] },
            }),
          },
        ],
      });
    });

    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].properties).toMatchObject({
      type: "single-choice",
      prompt: "Which one?",
      correctAnswer: "b",
    });
  });

  it("skips invalid non-legacy questions", () => {
    const { result } = renderHook(
      () => useExamList({ spaceId: "s1", examId: "e1" }),
      { wrapper: wrapperFor("u1") }
    );

    act(() => {
      bySuffix("/objects").next({
        docs: [
          {
            id: "q_bad",
            data: () => ({
              title: "Bad Question",
              properties: {
                type: "single-choice",
                // missing prompt, options, etc.
              },
            }),
          },
        ],
      });
    });

    expect(result.current.questions).toHaveLength(0);
  });

  it("surfaces snapshot errors from either subscription", () => {
    const { result } = renderHook(
      () => useExamList({ spaceId: "s1", examId: "e1" }),
      { wrapper: wrapperFor("u1") }
    );

    act(() => bySuffix("/objects").error(new Error("denied")));
    expect(result.current.error?.message).toBe("denied");
    expect(result.current.loading).toBe(false);

    act(() => bySuffix("/cards").error(new Error("cards")));
    expect(result.current.error?.message).toBe("cards");
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(
      () => useExamList({ spaceId: "s1", examId: "e1" }),
      { wrapper: wrapperFor("u1") }
    );
    unmount();
    for (const s of subscriptions) {
      expect(s.unsubscribe).toHaveBeenCalled();
    }
  });

  it("toggles the scroll-to-top button past the threshold and scrolls up", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    const { result } = renderHook(
      () => useExamList({ spaceId: "s1", examId: "e1" }),
      { wrapper: wrapperFor("u1") }
    );
    expect(result.current.showScrollToTop).toBe(false);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        value: SCROLL_TO_TOP_THRESHOLD + 1,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.showScrollToTop).toBe(true);

    act(() => result.current.scrollToTop());
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
