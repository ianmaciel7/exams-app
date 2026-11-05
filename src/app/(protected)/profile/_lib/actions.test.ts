import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProfileSnapshot } from "./definitions";

const mocks = vi.hoisted(() => ({
  verifySession: vi.fn(),
  readOwnProfile: vi.fn(),
  saveProfile: vi.fn(),
}));

vi.mock("@/lib/dal", () => ({ verifySession: mocks.verifySession }));
vi.mock("./data", () => ({
  readOwnProfile: mocks.readOwnProfile,
  saveProfile: mocks.saveProfile,
}));

import { updateProfile } from "./actions";

const current: ProfileSnapshot = {
  photoURL: null,
  values: {
    displayName: "Ada",
    email: "ada@example.com",
    locale: "en",
    theme: "system",
  },
};

function form(entries: Record<string, string | File>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(entries))
    formData.set(name, value);
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifySession.mockResolvedValue({ role: "user", userId: "user-123" });
  mocks.readOwnProfile.mockResolvedValue(current);
  mocks.saveProfile.mockImplementation(async ({ values }) => ({
    photoURL: null,
    values,
  }));
});

describe("updateProfile", () => {
  it("saves for the verified user and counts the save", async () => {
    const state = await updateProfile(
      null,
      form({ displayName: "Grace", locale: "es", theme: "dark" }),
    );
    expect(mocks.saveProfile).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "user-123", previous: current }),
    );
    expect(state).toMatchObject({
      hasError: false,
      savedCount: 1,
      values: { displayName: "Grace", locale: "es", theme: "dark" },
    });
  });

  it("rejects a caller without a verified session before touching data", async () => {
    mocks.verifySession.mockResolvedValue({ role: "user", userId: null });
    await expect(updateProfile(null, form({}))).rejects.toThrow(
      "session unavailable",
    );
    expect(mocks.saveProfile).not.toHaveBeenCalled();
  });

  it("returns the submitted values with an error when saving fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.saveProfile.mockRejectedValue(new Error("boom"));
    const state = await updateProfile(
      {
        values: current.values,
        photoURL: null,
        hasError: false,
        savedCount: 2,
      },
      form({ displayName: "Grace" }),
    );
    expect(state).toMatchObject({
      hasError: true,
      savedCount: 2,
      values: { displayName: "Grace" },
    });
    log.mockRestore();
  });

  it("rejects an unsupported avatar on the server", async () => {
    const state = await updateProfile(
      null,
      form({ avatar: new File(["x"], "a.txt", { type: "text/plain" }) }),
    );
    expect(state.hasError).toBe(true);
    expect(mocks.saveProfile).not.toHaveBeenCalled();
  });
});
