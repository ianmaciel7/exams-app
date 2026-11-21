import { act, renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/lib/auth-context";
import { useSpaces } from "./use-spaces";

const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => "SERVER_TIMESTAMP");

vi.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  serverTimestamp: () => mockServerTimestamp(),
  query: vi.fn((col) => col),
  orderBy: vi.fn(),
}));

vi.mock("@/lib/firebase/firestore", () => ({
  db: { type: "mock-firestore-db" },
}));

describe("useSpaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty spaces and loading false when user is null", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext
        value={{
          user: null,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        {children}
      </AuthContext>
    );

    const { result } = renderHook(() => useSpaces(), { wrapper });

    expect(result.current.spaces).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("subscribes to user spaces when user is authenticated", () => {
    const mockUser = { uid: "user-abc" } as unknown as User;
    const unsubscribeMock = vi.fn();

    let snapshotCallback: ((snapshot: unknown) => void) | null = null;
    mockOnSnapshot.mockImplementation((_query, onNext) => {
      snapshotCallback = onNext;
      return unsubscribeMock;
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext
        value={{
          user: mockUser,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        {children}
      </AuthContext>
    );

    const { result, unmount } = renderHook(() => useSpaces(), { wrapper });

    expect(result.current.loading).toBe(true);

    const mockSpacesData = [
      {
        id: "space-1",
        data: () => ({
          id: "space-1",
          ownerId: "user-abc",
          name: "Personal Space",
          description: "My personal notes",
          icon: "folder",
          stateVersion: 1,
          schemaVersion: 1,
          createdAt: null,
          updatedAt: null,
        }),
      },
    ];

    act(() => {
      if (snapshotCallback) {
        snapshotCallback({
          docs: mockSpacesData,
        });
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.spaces).toHaveLength(1);
    expect(result.current.spaces[0].name).toBe("Personal Space");
    expect(result.current.spaces[0].icon).toBe("folder");

    unmount();
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it("creates a space with correct attributes and returns new spaceId", async () => {
    const mockUser = { uid: "user-abc" } as unknown as User;
    mockOnSnapshot.mockReturnValue(vi.fn());
    mockSetDoc.mockResolvedValue(undefined);
    mockDoc.mockReturnValue({ path: "users/user-abc/spaces/mock-id" });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext
        value={{
          user: mockUser,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        {children}
      </AuthContext>
    );

    const { result } = renderHook(() => useSpaces(), { wrapper });

    let createdId = "";
    await act(async () => {
      createdId = await result.current.createSpace({
        name: "Work Notes",
        icon: "briefcase",
      });
    });

    expect(createdId).toBeTruthy();
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: "Work Notes",
        icon: "briefcase",
        ownerId: "user-abc",
        stateVersion: 1,
        schemaVersion: 1,
      })
    );
  });

  it("handles onSnapshot error callback", () => {
    const mockUser = { uid: "user-abc" } as unknown as User;
    let errorCallback: ((err: unknown) => void) | null = null;
    mockOnSnapshot.mockImplementation((_query, _onNext, onError) => {
      errorCallback = onError;
      return vi.fn();
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext
        value={{
          user: mockUser,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        {children}
      </AuthContext>
    );

    const { result } = renderHook(() => useSpaces(), { wrapper });

    act(() => {
      if (errorCallback) {
        errorCallback(new Error("Permission denied"));
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it("throws when createSpace is called without authenticated user", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext
        value={{
          user: null,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        {children}
      </AuthContext>
    );

    const { result } = renderHook(() => useSpaces(), { wrapper });

    await expect(
      result.current.createSpace({ name: "Test Space" })
    ).rejects.toThrow("Must be authenticated to create a space");
  });

  it("throws when createSpace is called with invalid data", async () => {
    const mockUser = { uid: "user-abc" } as unknown as User;
    mockOnSnapshot.mockReturnValue(vi.fn());

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext
        value={{
          user: mockUser,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        {children}
      </AuthContext>
    );

    const { result } = renderHook(() => useSpaces(), { wrapper });

    await expect(result.current.createSpace({ name: "" })).rejects.toThrow();
  });
});
