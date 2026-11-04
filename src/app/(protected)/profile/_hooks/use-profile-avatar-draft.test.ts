import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProfileAvatarDraft } from "./use-profile-avatar-draft";

describe("useProfileAvatarDraft", () => {
  const fileA = new File(["a"], "a.png", { type: "image/png" });
  const fileB = new File(["b"], "b.png", { type: "image/png" });

  it("defaults to null when no draft or action avatar is present", () => {
    const state0 = { count: 0 };
    const { result } = renderHook(() =>
      useProfileAvatarDraft({ actionState: state0, actionAvatar: null }),
    );

    expect(result.current.avatarFile).toBeNull();
    expect(result.current.pickedAvatar).toBeNull();
  });

  it("yields actionAvatar when no draft has been picked", () => {
    const state0 = { count: 0 };
    const { result } = renderHook(() =>
      useProfileAvatarDraft({ actionState: state0, actionAvatar: fileA }),
    );

    expect(result.current.avatarFile).toBe(fileA);
    expect(result.current.pickedAvatar).toBeNull();
  });

  it("prioritizes picked draft over actionAvatar", () => {
    const state0 = { count: 0 };
    const { result } = renderHook(() =>
      useProfileAvatarDraft({ actionState: state0, actionAvatar: fileA }),
    );

    act(() => {
      result.current.pickAvatar(fileB);
    });

    expect(result.current.avatarFile).toBe(fileB);
    expect(result.current.pickedAvatar).toBe(fileB);
  });

  it("clears draft and falls back to new actionAvatar when actionState changes", () => {
    let state = { count: 0 };
    let actionAvatar: File | null = null;

    const { result, rerender } = renderHook(() =>
      useProfileAvatarDraft({ actionState: state, actionAvatar }),
    );

    act(() => {
      result.current.pickAvatar(fileA);
    });
    expect(result.current.avatarFile).toBe(fileA);
    expect(result.current.pickedAvatar).toBe(fileA);

    // Simulate action failure: actionState changes and retains fileA
    state = { count: 1 };
    actionAvatar = fileA;
    rerender();

    expect(result.current.pickedAvatar).toBeNull();
    expect(result.current.avatarFile).toBe(fileA);

    // Pick a new file after failure
    act(() => {
      result.current.pickAvatar(fileB);
    });
    expect(result.current.pickedAvatar).toBe(fileB);
    expect(result.current.avatarFile).toBe(fileB);

    // Simulate action success after retry: actionState changes, actionAvatar is null
    state = { count: 2 };
    actionAvatar = null;
    rerender();

    expect(result.current.pickedAvatar).toBeNull();
    expect(result.current.avatarFile).toBeNull();
  });
});
