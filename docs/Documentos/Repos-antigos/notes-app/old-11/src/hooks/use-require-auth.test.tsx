import { renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/lib/auth-context";
import { useRequireAuth } from "./use-require-auth";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: replaceMock,
    prefetch: vi.fn(),
  }),
}));

describe("useRequireAuth", () => {
  it("redirects when not loading and user is null", () => {
    replaceMock.mockClear();

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

    renderHook(() => useRequireAuth("/login"), { wrapper });
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("does not redirect when user is authenticated", () => {
    replaceMock.mockClear();

    const mockUser = { uid: "test-123" } as unknown as User;

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

    renderHook(() => useRequireAuth("/login"), { wrapper });
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
