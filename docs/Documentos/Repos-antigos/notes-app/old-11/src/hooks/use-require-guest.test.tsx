import { renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/lib/auth-context";
import { useRequireGuest } from "./use-require-guest";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

describe("useRequireGuest", () => {
  it("redirects authenticated users", () => {
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

    renderHook(() => useRequireGuest("/notes"), { wrapper });

    expect(replaceMock).toHaveBeenCalledWith("/notes");
  });

  it("does not redirect guests", () => {
    replaceMock.mockClear();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext
        value={{ user: null, isLoading: false, signOutUser: async () => {} }}
      >
        {children}
      </AuthContext>
    );

    renderHook(() => useRequireGuest(), { wrapper });

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
