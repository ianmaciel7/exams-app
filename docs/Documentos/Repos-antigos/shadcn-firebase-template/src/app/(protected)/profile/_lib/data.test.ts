import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => ({
  db: { name: "firestore" },
  ref: { path: "users/user-123" },
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  getFirestore: vi.fn(),
  getSessionUser: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: firestoreMocks.doc,
  getDoc: firestoreMocks.getDoc,
  setDoc: firestoreMocks.setDoc,
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseFirestore: firestoreMocks.getFirestore,
  getFirebaseStorage: vi.fn(),
}));

vi.mock("@/lib/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session")>();
  return {
    ...actual,
    getSessionUser: firestoreMocks.getSessionUser,
  };
});

import {
  type ProfileDependencies,
  readProfile,
  readUserPreferences,
  saveProfile,
  writeUserPreferences,
} from "./data";
import type { ProfileValues } from "./definitions";

describe("user preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.getFirestore.mockReturnValue(firestoreMocks.db);
    firestoreMocks.doc.mockReturnValue(firestoreMocks.ref);
    firestoreMocks.setDoc.mockResolvedValue(undefined);
  });

  it("reads only supported locale and theme values", async () => {
    firestoreMocks.getDoc.mockResolvedValue({
      data: () => ({ locale: "pt-BR", theme: "dark", extra: "ignored" }),
    });

    await expect(readUserPreferences("user-123")).resolves.toEqual({
      locale: "pt-BR",
      theme: "dark",
    });
    expect(firestoreMocks.doc).toHaveBeenCalledWith(
      firestoreMocks.db,
      "users",
      "user-123",
    );
  });

  it("drops invalid stored values", async () => {
    firestoreMocks.getDoc.mockResolvedValue({
      data: () => ({ locale: "fr", theme: "solarized" }),
    });

    await expect(readUserPreferences("user-123")).resolves.toEqual({});
  });

  it("merges changes into the user's document", async () => {
    await writeUserPreferences("user-123", { theme: "light" });

    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(
      firestoreMocks.ref,
      { theme: "light" },
      { merge: true },
    );
  });
});

describe("readProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.getFirestore.mockReturnValue(firestoreMocks.db);
    firestoreMocks.doc.mockReturnValue(firestoreMocks.ref);
    firestoreMocks.getDoc.mockResolvedValue({ data: () => ({}) });
    firestoreMocks.getSessionUser.mockReturnValue({
      uid: "user",
      displayName: null,
      email: null,
    });
  });

  it("normalizes missing preferences using the active locale and system theme", async () => {
    expect(await readProfile("user", "pt-BR", () => true)).toEqual({
      values: { displayName: "", email: "", locale: "pt-BR", theme: "system" },
      theme: undefined,
    });
  });

  it("preserves stored locale and theme", async () => {
    firestoreMocks.getDoc.mockResolvedValue({
      data: () => ({ locale: "es", theme: "dark" }),
    });
    expect(await readProfile("user", "en", () => true)).toMatchObject({
      values: { locale: "es", theme: "dark" },
      theme: "dark",
    });
  });

  it("does not read a client session after the owning lifecycle was cancelled", async () => {
    const read = Promise.withResolvers<{ data: () => object }>();
    firestoreMocks.getDoc.mockReturnValue(read.promise);
    let active = true;
    const pending = readProfile("user", "en", () => active);
    active = false;
    read.resolve({ data: () => ({}) });
    expect(await pending).toBeNull();
    expect(firestoreMocks.getSessionUser).not.toHaveBeenCalled();
  });

  it("rejects profile resolved after the active user changes", async () => {
    firestoreMocks.getSessionUser.mockReturnValue({ uid: "other" });
    expect(await readProfile("user", "en", () => true)).toBeNull();
  });
});

const initial: ProfileValues = {
  displayName: "Before",
  email: "old@example.test",
  locale: "en",
  theme: "system",
};

function createDependencies() {
  const dependencies = {
    getActiveUser: vi.fn((user: User) => user),
    verifyBeforeUpdateEmail: vi.fn(async () => {}),
    updateProfile: vi.fn(async () => {}),
    uploadAvatar: vi.fn(async () => "https://example.test/avatar.png"),
    writeUserPreferences: vi.fn(async () => {}),
  } satisfies ProfileDependencies;
  return dependencies;
}

describe("saveProfile dependency boundaries", () => {
  it.each([
    "verifyBeforeUpdateEmail",
    "updateProfile",
    "writeUserPreferences",
  ] as const)(
    "rejects a stale session after %s completes",
    async (operation) => {
      const user = {
        uid: "user-1",
        email: initial.email,
        displayName: initial.displayName,
      } as User;
      const dependencies = createDependencies();
      let completeOperation: () => void = () => {};
      dependencies[operation].mockReturnValueOnce(
        new Promise<void>((resolve) => {
          completeOperation = resolve;
        }),
      );
      const saving = saveProfile(
        {
          user,
          previous: initial,
          values: {
            ...initial,
            displayName: "After",
            email: "new@example.test",
            theme: "dark",
          },
          avatarFile: null,
        },
        dependencies,
      );

      await vi.waitFor(() =>
        expect(dependencies[operation]).toHaveBeenCalledOnce(),
      );
      dependencies.getActiveUser.mockImplementation(() => {
        throw new Error("Authentication session unavailable");
      });
      completeOperation();

      await expect(saving).rejects.toThrow(
        "Authentication session unavailable",
      );
      if (operation === "verifyBeforeUpdateEmail") {
        expect(dependencies.uploadAvatar).not.toHaveBeenCalled();
        expect(dependencies.updateProfile).not.toHaveBeenCalled();
      }
      if (operation !== "writeUserPreferences") {
        expect(dependencies.writeUserPreferences).not.toHaveBeenCalled();
      }
    },
  );

  it("does not start profile or preference writes after the session changes during upload", async () => {
    const user = {
      uid: "user-1",
      email: initial.email,
      displayName: initial.displayName,
    } as User;
    const dependencies = createDependencies();
    let finishUpload: (url: string) => void = () => {};
    dependencies.uploadAvatar.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        finishUpload = resolve;
      }),
    );
    const saving = saveProfile(
      {
        user,
        previous: initial,
        values: { ...initial, displayName: "After", theme: "dark" },
        avatarFile: null,
      },
      dependencies,
    );
    dependencies.getActiveUser.mockImplementation(() => {
      throw new Error("Authentication session unavailable");
    });
    finishUpload("https://example.test/avatar.png");
    await expect(saving).rejects.toThrow("Authentication session unavailable");
    expect(dependencies.updateProfile).not.toHaveBeenCalled();
    expect(dependencies.writeUserPreferences).not.toHaveBeenCalled();
  });

  it("runs only necessary adapters for unchanged profile data", async () => {
    const user = {
      uid: "user-1",
      email: initial.email,
      displayName: initial.displayName,
      photoURL: null,
    } as User;
    const dependencies = createDependencies();

    const result = await saveProfile(
      { user, previous: initial, values: initial, avatarFile: null },
      dependencies,
    );

    expect(dependencies.getActiveUser).toHaveBeenCalledWith(user);
    expect(dependencies.verifyBeforeUpdateEmail).not.toHaveBeenCalled();
    expect(dependencies.updateProfile).not.toHaveBeenCalled();
    expect(dependencies.writeUserPreferences).not.toHaveBeenCalled();
    expect(dependencies.uploadAvatar).toHaveBeenCalledWith(user, null);
    expect(result.emailChanged).toBe(false);
    expect(result.avatarChanged).toBe(false);
  });

  it("orchestrates profile, email, avatar and preference updates through injected adapters", async () => {
    const user = {
      uid: "user-1",
      email: initial.email,
      displayName: initial.displayName,
    } as User;
    const values: ProfileValues = {
      displayName: "After",
      email: "new@example.test",
      locale: "es",
      theme: "dark",
    };
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const dependencies = createDependencies();

    const result = await saveProfile(
      { user, previous: initial, values, avatarFile: file },
      dependencies,
    );

    expect(dependencies.verifyBeforeUpdateEmail).toHaveBeenCalledWith(
      user,
      values.email,
    );
    expect(dependencies.updateProfile).toHaveBeenCalledWith(user, {
      displayName: values.displayName,
      photoURL: "https://example.test/avatar.png",
    });
    expect(dependencies.writeUserPreferences).toHaveBeenCalledWith(user.uid, {
      locale: "es",
      theme: "dark",
    });
    expect(dependencies.uploadAvatar).toHaveBeenCalledWith(user, file);
    expect(result).toMatchObject({
      emailChanged: true,
      avatarChanged: true,
      photoURL: "https://example.test/avatar.png",
    });
    expect(result.values.email).toBe(initial.email);
  });

  it("does not persist other changes after email verification fails", async () => {
    const user = {
      uid: "user-1",
      email: initial.email,
      displayName: initial.displayName,
    } as User;
    const dependencies = createDependencies();
    dependencies.verifyBeforeUpdateEmail.mockRejectedValueOnce(
      new Error("verification unavailable"),
    );
    await expect(
      saveProfile(
        {
          user,
          previous: initial,
          values: { ...initial, email: "new@example.test" },
          avatarFile: null,
        },
        dependencies,
      ),
    ).rejects.toThrow("verification unavailable");
    expect(dependencies.uploadAvatar).not.toHaveBeenCalled();
    expect(dependencies.writeUserPreferences).not.toHaveBeenCalled();
    expect(dependencies.updateProfile).not.toHaveBeenCalled();
  });
});
