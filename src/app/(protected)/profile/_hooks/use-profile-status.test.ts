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
  it("waits for user preferences", () => {
    const { result } = renderHook(() =>
      useProfileStatus(session({ preferencesReady: false })),
    );
    expect(result.current).toMatchObject({ isLoading: true, isReady: false });
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

  it("provides the authenticated user's identity only when ready", () => {
    const { result } = renderHook(() => useProfileStatus(session()));
    expect(result.current).toMatchObject({
      isReady: true,
      userId: "user-123",
    });
  });
});
