import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  save: vi.fn(),
  verifySession: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({ getLocale: async () => "pt-BR" }));
vi.mock("../../_lib/dal", () => ({ verifySession: mocks.verifySession }));
vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    getUser: mocks.getUser,
    updateUser: mocks.updateUser,
  }),
  getAdminFirestore: () => ({
    collection: () => ({
      doc: () => ({ get: mocks.get, set: mocks.set }),
    }),
  }),
  getAdminBucket: () => ({
    file: () => ({
      name: "users/user-123/avatar",
      bucket: { name: "demo.appspot.com" },
      save: mocks.save,
    }),
  }),
}));

import {
  readOwnProfile,
  readProfile,
  readUserPreferences,
  saveProfile,
} from "./data";
import type { ProfileSnapshot } from "./definitions";

const previous: ProfileSnapshot = {
  photoURL: "https://example.com/old.png",
  values: {
    displayName: "Ada",
    email: "ada@example.com",
    locale: "en",
    theme: "system",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.set.mockResolvedValue(undefined);
  mocks.save.mockResolvedValue(undefined);
  mocks.updateUser.mockResolvedValue(undefined);
  mocks.verifySession.mockResolvedValue({ role: "user", userId: "user-123" });
  mocks.get.mockResolvedValue({ data: () => ({}) });
});

describe("profile reads", () => {
  it("keeps only supported locale and theme values", async () => {
    mocks.get.mockResolvedValue({
      data: () => ({ locale: "pt-BR", theme: "dark", extra: "ignored" }),
    });
    await expect(readUserPreferences("user-123")).resolves.toEqual({
      locale: "pt-BR",
      theme: "dark",
    });
    mocks.get.mockResolvedValue({
      data: () => ({ locale: "fr", theme: "solarized" }),
    });
    await expect(readUserPreferences("user-123")).resolves.toEqual({});
  });

  it("combines the Auth user with the stored preferences", async () => {
    mocks.getUser.mockResolvedValue({
      displayName: "Ada",
      email: "ada@example.com",
      photoURL: "https://example.com/a.png",
    });
    mocks.get.mockResolvedValue({ data: () => ({ theme: "dark" }) });

    await expect(readProfile("user-123", "en")).resolves.toEqual({
      photoURL: "https://example.com/a.png",
      values: {
        displayName: "Ada",
        email: "ada@example.com",
        locale: "en",
        theme: "dark",
      },
    });
  });

  it("reads the verified user's own profile with the active locale", async () => {
    mocks.getUser.mockResolvedValue({ email: "ada@example.com" });
    const profile = await readOwnProfile();
    expect(mocks.getUser).toHaveBeenCalledWith("user-123");
    expect(profile.values).toMatchObject({ displayName: "", locale: "pt-BR" });
  });

  it("refuses to read without a verified user", async () => {
    mocks.verifySession.mockResolvedValue({ role: "user", userId: null });
    await expect(readOwnProfile()).rejects.toThrow("session unavailable");
  });
});

describe("saveProfile", () => {
  it("writes nothing when nothing changed", async () => {
    const saved = await saveProfile({
      uid: "user-123",
      previous,
      values: previous.values,
      avatarFile: null,
    });
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
    expect(saved).toEqual(previous);
  });

  it("updates the name and the preferences, never the e-mail", async () => {
    const saved = await saveProfile({
      uid: "user-123",
      previous,
      values: {
        ...previous.values,
        displayName: " Grace ",
        email: "attacker@example.com",
        theme: "dark",
      },
      avatarFile: null,
    });
    expect(mocks.updateUser).toHaveBeenCalledWith("user-123", {
      displayName: "Grace",
      photoURL: previous.photoURL,
    });
    expect(mocks.set).toHaveBeenCalledWith(
      { locale: "en", theme: "dark" },
      { merge: true },
    );
    expect(saved.values.email).toBe("ada@example.com");
  });

  it("uploads a new avatar and stores its download URL", async () => {
    const avatarFile = new File(["x"], "a.png", { type: "image/png" });
    const saved = await saveProfile({
      uid: "user-123",
      previous,
      values: previous.values,
      avatarFile,
    });
    expect(mocks.save).toHaveBeenCalledWith(expect.any(Buffer), {
      contentType: "image/png",
      metadata: {
        metadata: { firebaseStorageDownloadTokens: expect.any(String) },
      },
    });
    const url = new URL(saved.photoURL ?? "");
    expect(url.origin).toBe("https://firebasestorage.googleapis.com");
    expect(decodeURIComponent(url.pathname)).toBe(
      "/v0/b/demo.appspot.com/o/users/user-123/avatar",
    );
    expect(url.searchParams.get("alt")).toBe("media");
    expect(url.searchParams.get("token")).toBeTruthy();
    expect(mocks.updateUser).toHaveBeenCalledWith("user-123", {
      displayName: "Ada",
      photoURL: saved.photoURL,
    });
  });
});
