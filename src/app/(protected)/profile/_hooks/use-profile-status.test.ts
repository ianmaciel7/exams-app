import { renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import { describe, expect, it, vi } from "vitest";
import type { useProfileSession } from "./use-profile-session";
import { useProfileStatus } from "./use-profile-status";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

type Session = ReturnType<typeof useProfileSession>;
const user = { uid: "user-123" } as User;
const values = {
  displayName: "Ada",
  email: "ada@example.com",
  locale: "en" as const,
  theme: "system" as const,
};

function session(overrides: Partial<Session> = {}): Session {
  return {
    activeLocale: "en",
    authReady: true,
    avatarVersion: 0,
    defaultValues: values,
    error: null,
    photoURL: null,
    preferencesReady: true,
    savedValuesRef: { current: values },
    setAvatarVersion: vi.fn(),
    setPhotoURL: vi.fn(),
    setTheme: vi.fn(),
    user,
    ...overrides,
  };
}

describe("useProfileStatus", () => {
  it.each([
    session({ authReady: false }),
    session({ preferencesReady: false }),
  ])("waits for authentication and user preferences", (pending) => {
    const { result } = renderHook(() => useProfileStatus(pending));
    expect(result.current).toMatchObject({ isLoading: true, isReady: false });
  });

  it("hides the profile after unauthenticated redirect without an error", () => {
    const { result } = renderHook(() =>
      useProfileStatus(session({ user: null, defaultValues: null })),
    );
    expect(result.current).toMatchObject({ isHidden: true, isReady: false });
  });

  it.each([
    { error: "Session unavailable", expected: "Session unavailable" },
    { error: null, expected: "profileLoadError" },
  ])(
    "resolves a missing-defaults error in the hook: $expected",
    ({ error, expected }) => {
      const { result } = renderHook(() =>
        useProfileStatus(session({ defaultValues: null, error })),
      );
      expect(result.current).toMatchObject({
        isError: true,
        errorMessage: expected,
      });
    },
  );

  it("renders an authentication error instead of hiding it", () => {
    const { result } = renderHook(() =>
      useProfileStatus(session({ user: null, error: "Authentication failed" })),
    );
    expect(result.current).toMatchObject({
      isError: true,
      errorMessage: "Authentication failed",
    });
  });

  it("provides the authenticated user's identity only when ready", () => {
    const { result } = renderHook(() => useProfileStatus(session()));
    expect(result.current).toMatchObject({
      isReady: true,
      userId: "user-123",
    });
  });
});
