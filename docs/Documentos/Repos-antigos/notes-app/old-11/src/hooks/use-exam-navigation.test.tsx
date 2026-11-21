import { act, renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/lib/auth-context";
import { useExamNavigation } from "./use-exam-navigation";

type Handlers = {
  next: (snapshot: { docs: { id: string; data: () => unknown }[] }) => void;
  error: (error: Error) => void;
  unsubscribe: ReturnType<typeof vi.fn>;
  path: string;
};

const subscriptions: Handlers[] = [];
const mockWhere = vi.fn((...args: unknown[]) => ({ where: args }));

vi.mock("firebase/firestore", () => ({
  collection: (_db: unknown, ...path: string[]) => ({ path: path.join("/") }),
  query: (ref: { path: string }) => ref,
  where: (...args: unknown[]) => mockWhere(...args),
  onSnapshot: (
    ref: { path: string },
    next: Handlers["next"],
    error: Handlers["error"]
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

describe("useExamNavigation", () => {
  beforeEach(() => {
    subscriptions.length = 0;
    vi.clearAllMocks();
  });

  it("does not subscribe without a user", () => {
    const { result } = renderHook(() => useExamNavigation({ spaceId: "s1" }), {
      wrapper: wrapperFor(null),
    });
    expect(subscriptions).toHaveLength(0);
    expect(result.current).toEqual({ exams: [], loading: false, error: null });
  });

  it("subscribes to active exam objects and sorts them by title", () => {
    const { result } = renderHook(() => useExamNavigation({ spaceId: "s1" }), {
      wrapper: wrapperFor("u1"),
    });

    expect(subscriptions[0].path).toBe("users/u1/spaces/s1/objects");
    expect(mockWhere).toHaveBeenCalledWith("objectTypeId", "==", "exam");
    expect(mockWhere).toHaveBeenCalledWith("lifecycleState", "==", "active");
    expect(result.current.loading).toBe(true);

    act(() =>
      subscriptions[0].next({
        docs: [
          { id: "e2", data: () => ({ title: "Zeta" }) },
          { id: "e1", data: () => ({ title: "Alpha" }) },
        ],
      })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.exams).toEqual([
      { id: "e1", title: "Alpha" },
      { id: "e2", title: "Zeta" },
    ]);
  });

  it("exposes subscription errors and unsubscribes on unmount", () => {
    const { result, unmount } = renderHook(
      () => useExamNavigation({ spaceId: "s1" }),
      { wrapper: wrapperFor("u1") }
    );

    const failure = new Error("permission-denied");
    act(() => subscriptions[0].error(failure));
    expect(result.current.error).toBe(failure);
    expect(result.current.loading).toBe(false);

    unmount();
    expect(subscriptions[0].unsubscribe).toHaveBeenCalled();
  });
});
