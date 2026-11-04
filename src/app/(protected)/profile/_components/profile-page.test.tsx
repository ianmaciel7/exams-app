import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Activity, Component, type ReactNode, Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProviderClient } from "@/components/ui/extensions/session-provider-client";
import { AuthGuardClient } from "../../_components/auth-guard-client";
import ProfileError from "../error";
import ProfileLoading from "../loading";
import ProfilePage from "../page";

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() },
  subscribe: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  verifyBeforeUpdateEmail: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  getUI: vi.fn(),
  getStorage: vi.fn(),
  readPreferences: vi.fn(),
  writePreferences: vi.fn(),
  setTheme: vi.fn(),
  toastAdd: vi.fn(),
  currentUser: null as unknown,
  locale: "en",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
  usePathname: () => "/profile",
}));

vi.mock("@/lib/firebase/usage", () => ({
  recordUsage: async () => {},
  withUsageGuard: async (_event: unknown, operation: () => Promise<unknown>) =>
    operation(),
}));

const translate = (key: string) => key;

vi.mock("next-intl", () => ({
  hasLocale: (locales: readonly string[], value: unknown) =>
    typeof value === "string" && locales.includes(value),
  useTranslations: () => translate,
  useLocale: () => mocks.locale,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => translate,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme: mocks.setTheme }),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mocks.subscribe,
  signOut: mocks.signOut,
  updateProfile: mocks.updateProfile,
  verifyBeforeUpdateEmail: mocks.verifyBeforeUpdateEmail,
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_, collection: string, id: string) => `${collection}/${id}`),
  getDoc: async (ref: string) => {
    const uid = ref.split("/")[1];
    const data = await mocks.readPreferences(uid);
    return { data: () => data };
  },
  setDoc: async (ref: string, data: unknown) => {
    const uid = ref.split("/")[1];
    return mocks.writePreferences(uid, data);
  },
}));

vi.mock("firebase/storage", () => ({
  getDownloadURL: mocks.getDownloadURL,
  ref: vi.fn(() => "avatar-ref"),
  uploadBytes: mocks.uploadBytes,
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseFirestore: vi.fn(() => "firestore"),
  getFirebaseStorage: mocks.getStorage,
  getFirebaseUI: mocks.getUI,
}));

vi.mock("@/lib/toast", () => ({
  toast: {
    add: mocks.toastAdd,
  },
}));

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: mocks.toastAdd,
  },
}));

/** Stands in for the boundary Next.js builds from the segment's `error.tsx`. */
class SegmentErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <ProfileError
        error={error}
        retry={() => this.setState({ error: null })}
      />
    );
  }
}

/** Firebase loads on demand; wait for it so the gate has subscribed. */
async function renderProfile() {
  // The route entrypoint is an async Server Component: resolve it first.
  const page = await ProfilePage();
  const tree = (mode: "visible" | "hidden") => (
    <SessionProviderClient>
      <AuthGuardClient>
        <SegmentErrorBoundary>
          <Activity mode={mode}>
            <Suspense fallback={<ProfileLoading />}>{page}</Suspense>
          </Activity>
        </SegmentErrorBoundary>
      </AuthGuardClient>
    </SessionProviderClient>
  );
  const rendered = render(tree("visible"));
  await act(() => vi.dynamicImportSettled());
  return {
    ...rendered,
    setVisibility: (mode: "visible" | "hidden") =>
      rendered.rerender(tree(mode)),
  };
}

/**
 * Flushes session changes and the asynchronous profile read in one act scope.
 */
async function settleAfter(update: () => void) {
  await act(async () => {
    update();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function findAvatarInput() {
  await screen.findByRole("button", { name: "profilePhotoChange" });
  return document.querySelector<HTMLInputElement>(
    "input[type=file]",
  ) as HTMLInputElement;
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.locale = "en";
    mocks.getUI.mockReturnValue({
      get: () => ({
        auth: {
          get currentUser() {
            return mocks.currentUser;
          },
        },
      }),
    });
    mocks.subscribe.mockImplementation((_auth, callback) => {
      callback(mocks.currentUser);
      return () => {};
    });
    mocks.readPreferences.mockResolvedValue({});
    mocks.writePreferences.mockResolvedValue(undefined);
    mocks.updateProfile.mockResolvedValue(undefined);
    mocks.verifyBeforeUpdateEmail.mockResolvedValue(undefined);
    mocks.uploadBytes.mockResolvedValue(undefined);
    mocks.getDownloadURL.mockResolvedValue("https://example.com/avatar.png");
    mocks.getStorage.mockReturnValue("storage");
  });

  afterEach(cleanup);

  it("leaves the sign-in redirect and its return path to the gate", async () => {
    mocks.currentUser = null;
    window.history.replaceState(null, "", "/profile?tab=security");
    const { container } = await renderProfile();
    expect(container.querySelector('[data-slot="card"]')).toBeNull();
    expect(mocks.router.replace).toHaveBeenCalledOnce();
    expect(mocks.router.replace).toHaveBeenCalledWith(
      `/sign-in?next=${encodeURIComponent("/profile?tab=security")}`,
    );
    window.history.replaceState(null, "", "/");
  });

  it("does not show the previous account's profile after an account switch", async () => {
    mocks.currentUser = { uid: "user-a", displayName: "User A" };
    let authCallback: (user: unknown) => void = () => {};
    mocks.subscribe.mockImplementation((_auth, callback) => {
      authCallback = callback;
      callback(mocks.currentUser);
      return () => {};
    });
    let finishRead!: (value: object) => void;
    mocks.readPreferences.mockResolvedValueOnce({});
    await renderProfile();
    const nameField = (await screen.findByLabelText(
      "displayNameLabel",
    )) as HTMLInputElement;
    expect(nameField.value).toBe("User A");

    mocks.readPreferences.mockReturnValueOnce(
      new Promise((resolve) => {
        finishRead = resolve;
      }),
    );
    mocks.currentUser = { uid: "user-b", displayName: "User B" };
    await act(async () => authCallback(mocks.currentUser));
    expect(screen.queryByLabelText("displayNameLabel")).toBeNull();

    await settleAfter(() => finishRead({}));
    expect(
      ((await screen.findByLabelText("displayNameLabel")) as HTMLInputElement)
        .value,
    ).toBe("User B");
  });

  it("renders user information with fallback when fields are not set", async () => {
    mocks.currentUser = { uid: "user-123", email: null, displayName: null };
    await renderProfile();

    await waitFor(() => {
      expect(screen.getByText("personalInfoTitle")).toBeTruthy();
    });
    expect(screen.getByPlaceholderText("notSet")).toBeTruthy();
    expect(
      (screen.getByLabelText("emailLabel") as HTMLInputElement).value,
    ).toBe("");
  });

  it("renders user profile with displayName, email, and photoURL", async () => {
    mocks.currentUser = {
      uid: "uid-abc",
      email: "user@example.com",
      displayName: "Ada Lovelace",
      photoURL: "https://example.com/photo.jpg",
    };
    await renderProfile();

    await waitFor(() => {
      expect(
        (screen.getByLabelText("displayNameLabel") as HTMLInputElement).value,
      ).toBe("Ada Lovelace");
    });
    expect(
      (screen.getByLabelText("emailLabel") as HTMLInputElement).value,
    ).toBe("user@example.com");
    expect(screen.getByText("profilePhotoTitle")).toBeTruthy();
    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    expect(screen.queryByText("user@example.com")).toBeNull();
  });

  it("renders language and theme preferences", async () => {
    mocks.currentUser = { uid: "user-123" };

    await renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText("languageLabel")).toBeTruthy();
    });
    expect(screen.getByLabelText("themeLabel")).toBeTruthy();
    expect(screen.getByLabelText("languageLabel").textContent).toContain(
      "languageOptions.en",
    );
    expect(screen.getByLabelText("themeLabel").textContent).toContain(
      "themeOptions.system",
    );
    expect(screen.queryByText("preferencesDescription")).toBeNull();
    expect(screen.queryByText("preferencesTitle")).toBeNull();
  });

  it("shows the loading state while preferences load", async () => {
    mocks.currentUser = { uid: "user-pending" };
    mocks.readPreferences.mockReturnValue(new Promise(() => {}));

    const { container } = await renderProfile();

    await vi.waitFor(() =>
      expect(
        container.querySelector('[data-slot="loading-status"]'),
      ).not.toBeNull(),
    );
    expect(container.querySelector('[data-slot="card"]')).toBeNull();
  });

  it("throws a failed read to the segment error boundary and retries it", async () => {
    mocks.currentUser = { uid: "user-123", displayName: "Ada" };
    mocks.readPreferences.mockRejectedValueOnce(
      new Error("Preferences failed"),
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      await renderProfile();
      expect((await screen.findByRole("alert")).textContent).toBe(
        "profileLoadError",
      );
      expect(screen.queryByLabelText("displayNameLabel")).toBeNull();

      await settleAfter(() =>
        fireEvent.click(screen.getByRole("button", { name: "tryAgain" })),
      );

      expect(
        ((await screen.findByLabelText("displayNameLabel")) as HTMLInputElement)
          .value,
      ).toBe("Ada");
      expect(mocks.readPreferences).toHaveBeenCalledTimes(2);
    } finally {
      log.mockRestore();
    }
  });

  it("renders the fields and buttons in one form inside CardContent", async () => {
    mocks.currentUser = { uid: "user-123", email: "user@example.com" };
    await renderProfile();

    const saveButton = await screen.findByRole("button", {
      name: "saveProfile",
    });
    const displayName = screen.getByLabelText("displayNameLabel");
    const form = saveButton.closest("form");

    expect(form).toBeTruthy();
    expect(displayName.closest("form")).toBe(form);
    expect(form?.closest('[data-slot="card-content"]')).toBeTruthy();
    expect(form?.querySelectorAll("form")).toHaveLength(0);
    expect(saveButton.getAttribute("type")).toBe("submit");
  });

  it("uploads a new avatar and updates the auth profile", async () => {
    mocks.currentUser = {
      uid: "user-123",
      email: "user@example.com",
    };
    await renderProfile();

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    fireEvent.change(await findAvatarInput(), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));

    await waitFor(() =>
      expect(mocks.uploadBytes).toHaveBeenCalledWith("avatar-ref", file, {
        contentType: "image/png",
      }),
    );
    expect(mocks.updateProfile).toHaveBeenCalledWith(mocks.currentUser, {
      photoURL: "https://example.com/avatar.png",
    });
    expect(mocks.toastAdd).toHaveBeenCalledWith({
      title: "profileSaved",
      type: "success",
    });
  });

  it("shows error toast when invalid avatar is chosen", async () => {
    mocks.currentUser = { uid: "user-123", email: "user@example.com" };
    await renderProfile();

    const file = new File(["test"], "test.txt", { type: "text/plain" });
    fireEvent.change(await findAvatarInput(), {
      target: { files: [file] },
    });

    expect(mocks.toastAdd).toHaveBeenCalledWith({
      title: "profilePhotoInvalid",
      type: "error",
    });
  });

  it("applies saved preferences from the user's document", async () => {
    mocks.currentUser = { uid: "user-123" };
    mocks.locale = "es";
    mocks.readPreferences.mockResolvedValue({ locale: "es", theme: "dark" });

    await renderProfile();

    await waitFor(() => expect(mocks.setTheme).toHaveBeenCalledWith("dark"));
    expect(mocks.readPreferences).toHaveBeenCalledWith("user-123");
  });

  it("synchronizes the locale and renders the loaded profile", async () => {
    mocks.currentUser = { uid: "user-locale-sync" };
    mocks.readPreferences.mockResolvedValue({ locale: "pt-BR" });

    const { container } = await renderProfile();

    await waitFor(() => expect(mocks.router.refresh).toHaveBeenCalledOnce());
    expect(document.cookie).toContain("NEXT_LOCALE=pt-BR");
    expect(await screen.findByLabelText("languageLabel")).toBeTruthy();
    expect(container.querySelector('[data-slot="card"]')).not.toBeNull();
  });

  it("does not apply preferences from a read abandoned before mounting", async () => {
    mocks.currentUser = { uid: "abandoned-profile" };
    let finish!: (value: object) => void;
    mocks.readPreferences.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const view = await renderProfile();
    view.unmount();
    const cookie = document.cookie;

    await settleAfter(() => finish({ locale: "es", theme: "dark" }));

    expect(mocks.setTheme).not.toHaveBeenCalled();
    expect(mocks.router.refresh).not.toHaveBeenCalled();
    expect(document.cookie).toBe(cookie);
  });

  it("times out a stalled read, ignores its late result and supports retry", async () => {
    vi.useFakeTimers();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.currentUser = { uid: "profile-timeout", displayName: "Ada" };
    let finish!: (value: object) => void;
    mocks.readPreferences.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    try {
      await renderProfile();
      await act(() => vi.advanceTimersByTimeAsync(15_000));
      expect(screen.getByRole("alert").textContent).toBe("profileLoadError");

      await act(async () => finish({ locale: "es", theme: "dark" }));
      expect(mocks.setTheme).not.toHaveBeenCalled();
      expect(mocks.router.refresh).not.toHaveBeenCalled();

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "tryAgain" }));
      });
      expect(screen.getByDisplayValue("Ada")).toBeTruthy();
      expect(mocks.readPreferences).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole("alert")).toBeNull();
    } finally {
      vi.useRealTimers();
      log.mockRestore();
    }
  });

  it("reads fresh data on the next visit without keeping a browser cache", async () => {
    mocks.currentUser = { uid: "revisited-profile", displayName: "Before" };
    const first = await renderProfile();
    expect(await screen.findByDisplayValue("Before")).toBeTruthy();
    first.unmount();

    mocks.currentUser = { uid: "revisited-profile", displayName: "After" };
    await renderProfile();
    expect(await screen.findByDisplayValue("After")).toBeTruthy();
    expect(mocks.readPreferences).toHaveBeenCalledTimes(2);
  });

  it("recovers when returning to an account whose pending read lost its session", async () => {
    const firstUser = { uid: "interrupted-account", displayName: "First" };
    mocks.currentUser = firstUser;
    let changeSession!: (user: unknown) => void;
    mocks.subscribe.mockImplementation((_auth, callback) => {
      changeSession = callback;
      callback(mocks.currentUser);
      return () => {};
    });
    let finish!: (value: object) => void;
    mocks.readPreferences.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await renderProfile();

    mocks.currentUser = { uid: "other-account", displayName: "Other" };
    await settleAfter(() => changeSession(mocks.currentUser));
    await screen.findByDisplayValue("Other");
    await settleAfter(() => finish({ theme: "dark" }));

    mocks.currentUser = firstUser;
    await settleAfter(() => changeSession(firstUser));
    expect(await screen.findByDisplayValue("First")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(mocks.readPreferences).toHaveBeenCalledTimes(3);
  });

  it("preserves saved preferences when Activity hides and reveals the form", async () => {
    mocks.currentUser = { uid: "activity-profile", email: "ada@example.test" };
    mocks.readPreferences.mockResolvedValue({ theme: "light" });
    const view = await renderProfile();
    fireEvent.click(await screen.findByLabelText("themeLabel"));
    const dark = await screen.findByRole("option", {
      name: "themeOptions.dark",
    });
    fireEvent.pointerDown(dark);
    fireEvent.pointerUp(dark);
    fireEvent.click(dark);
    fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));
    await waitFor(() =>
      expect(mocks.setTheme).toHaveBeenLastCalledWith("dark"),
    );
    await screen.findByRole("button", { name: "saveProfile" });

    view.setVisibility("hidden");
    view.setVisibility("visible");

    expect(mocks.setTheme).toHaveBeenLastCalledWith("dark");
    expect(mocks.readPreferences).toHaveBeenCalledTimes(1);
  });

  it("saves a changed theme preference and shows success toast", async () => {
    mocks.currentUser = { uid: "user-123", email: "user@example.com" };
    await renderProfile();

    fireEvent.click(await screen.findByLabelText("themeLabel"));
    const darkOption = await screen.findByRole("option", {
      name: "themeOptions.dark",
    });
    fireEvent.pointerDown(darkOption);
    fireEvent.pointerUp(darkOption);
    fireEvent.click(darkOption);

    fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));

    await waitFor(() =>
      expect(mocks.writePreferences).toHaveBeenCalledWith("user-123", {
        locale: "en",
        theme: "dark",
      }),
    );
    expect(mocks.setTheme).toHaveBeenCalledWith("dark");
    expect(mocks.toastAdd).toHaveBeenCalledWith({
      title: "profileSaved",
      type: "success",
    });
  });

  it("links an invalid email to its error, focuses it and does not save", async () => {
    mocks.currentUser = { uid: "user-123", email: "old@example.com" };
    await renderProfile();

    const email = await screen.findByLabelText("emailLabel");
    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));

    const error = await screen.findByText("emailInvalid");
    await waitFor(() => expect(document.activeElement).toBe(email));
    expect(email.getAttribute("aria-invalid")).toBe("true");
    const describedBy = email.getAttribute("aria-describedby") ?? "";
    expect(describedBy.split(" ")).toContain(error.id);
    expect(mocks.verifyBeforeUpdateEmail).not.toHaveBeenCalled();
    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });

  it("updates the display name and requests email verification with toast", async () => {
    mocks.currentUser = {
      uid: "user-123",
      email: "old@example.com",
      displayName: "Old Name",
    };
    await renderProfile();

    fireEvent.change(await screen.findByLabelText("displayNameLabel"), {
      target: { value: "New Name" },
    });
    fireEvent.change(screen.getByLabelText("emailLabel"), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));

    await waitFor(() =>
      expect(mocks.updateProfile).toHaveBeenCalledWith(mocks.currentUser, {
        displayName: "New Name",
      }),
    );
    expect(mocks.verifyBeforeUpdateEmail).toHaveBeenCalledWith(
      mocks.currentUser,
      "new@example.com",
    );
    expect(mocks.toastAdd).toHaveBeenCalledWith({
      title: "emailVerificationSent",
      type: "success",
    });
  });

  it("saves a changed language preference and refreshes without a locale-prefixed route", async () => {
    mocks.currentUser = { uid: "user-123", email: "user@example.com" };
    await renderProfile();

    fireEvent.click(await screen.findByLabelText("languageLabel"));
    const spanishOption = await screen.findByRole("option", {
      name: "languageOptions.es",
    });
    fireEvent.pointerDown(spanishOption);
    fireEvent.pointerUp(spanishOption);
    fireEvent.click(spanishOption);

    fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));

    await waitFor(() =>
      expect(mocks.writePreferences).toHaveBeenCalledWith("user-123", {
        locale: "es",
        theme: "system",
      }),
    );
    expect(document.cookie).toContain("NEXT_LOCALE=es");
    expect(mocks.router.refresh).toHaveBeenCalledOnce();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(mocks.toastAdd).toHaveBeenCalledWith({
      title: "profileSaved",
      type: "success",
    });
  });

  it("updates user state on auth change event", async () => {
    mocks.currentUser = null;
    let authCallback: (user: unknown) => void = () => {};
    mocks.subscribe.mockImplementation((_auth, callback) => {
      authCallback = callback;
      return () => {};
    });
    await renderProfile();
    const dynamicUser = {
      uid: "uid-dynamic",
      email: "dynamic@example.com",
      displayName: "Dynamic User",
    };
    mocks.currentUser = dynamicUser;
    await settleAfter(() => authCallback(dynamicUser));
    expect(
      ((await screen.findByLabelText("displayNameLabel")) as HTMLInputElement)
        .value,
    ).toBe("Dynamic User");
  });

  it("keeps the home link available during saving without submitting or signing out", async () => {
    mocks.currentUser = {
      uid: "user-123",
      email: "user@example.com",
      displayName: "Before",
    };
    let finish!: () => void;
    mocks.updateProfile.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    await renderProfile();
    fireEvent.change(await screen.findByLabelText("displayNameLabel"), {
      target: { value: "After" },
    });
    fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));
    await screen.findByRole("button", { name: "savingProfile" });
    const home = screen.getByRole("link", { name: "backToHome" });
    expect(home.getAttribute("href")).toBe("/");
    expect(home.hasAttribute("disabled")).toBe(false);
    expect(mocks.signOut).not.toHaveBeenCalled();
    await act(async () => finish());
    await screen.findByRole("button", { name: "saveProfile" });
  });

  it("retains an avatar after a failed save and clears it after a successful retry", async () => {
    mocks.currentUser = { uid: "user-123", email: "user@example.com" };
    mocks.uploadBytes.mockRejectedValueOnce(new Error("Upload failed"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await renderProfile();
      const input = (await findAvatarInput()) as HTMLInputElement;
      const file = new File(["avatar"], "avatar.png", { type: "image/png" });
      fireEvent.change(input, { target: { files: [file] } });
      fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));
      await waitFor(() =>
        expect(screen.getByRole("alert").textContent).toBe("profileSaveError"),
      );
      expect(mocks.toastAdd).not.toHaveBeenCalled();
      const save = await screen.findByRole("button", { name: "saveProfile" });
      fireEvent.click(save);
      await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalled());
      await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
      expect(mocks.uploadBytes).toHaveBeenCalledTimes(2);
      await screen.findByRole("button", { name: "saveProfile" });
      fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));
      await waitFor(() => expect(mocks.toastAdd).toHaveBeenCalledTimes(2));
      expect(mocks.uploadBytes).toHaveBeenCalledTimes(2);
      expect(input.value).toBe("");
    } finally {
      log.mockRestore();
    }
  });
});
