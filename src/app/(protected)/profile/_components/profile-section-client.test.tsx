import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileSectionClient } from "./profile-section-client";

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
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/profile",
  useRouter: () => mocks.router,
}));

vi.mock("@/lib/firebase/usage", () => ({
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

describe("ProfileSectionClient", () => {
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

  it("renders nothing when user is null", () => {
    mocks.currentUser = null;
    const { container } = render(<ProfileSectionClient />);
    expect(container.firstChild).toBeNull();
    expect(mocks.router.replace).toHaveBeenCalledWith("/sign-in");
  });

  it("forwards element props to the card while the session is active", async () => {
    mocks.currentUser = { uid: "user-123", email: "user@example.com" };
    render(<ProfileSectionClient data-testid="profile-section" />);

    await waitFor(() => {
      expect(
        screen.getByTestId("profile-section").getAttribute("data-slot"),
      ).toBe("card");
    });
  });

  it("renders user information with fallback when fields are not set", async () => {
    mocks.currentUser = { uid: "user-123", email: null, displayName: null };
    render(<ProfileSectionClient />);

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
    render(<ProfileSectionClient />);

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

    render(<ProfileSectionClient />);

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

  it("does not render an empty card while profile preferences load", async () => {
    mocks.currentUser = { uid: "user-123" };
    mocks.readPreferences.mockReturnValue(new Promise(() => {}));

    const { container } = render(
      <ProfileSectionClient data-testid="loading-profile" />,
    );

    const status = await screen.findByRole("status");
    expect(status.closest('[data-slot="loading-overlay"]')).toBeTruthy();
    expect(status.parentElement?.className).toContain("h-svh");
    expect(screen.getByTestId("loading-profile")).toBeTruthy();
    expect(container.querySelector('[data-slot="card"]')).toBeNull();
  });

  it("renders an accessible error when preferences cannot load", async () => {
    mocks.currentUser = { uid: "user-123" };
    mocks.readPreferences.mockRejectedValue(new Error("Preferences failed"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      render(<ProfileSectionClient />);
      expect((await screen.findByRole("alert")).textContent).toBe(
        "profileLoadError",
      );
    } finally {
      log.mockRestore();
    }
  });

  it("keeps form fields in CardContent and buttons in CardFooter", async () => {
    mocks.currentUser = { uid: "user-123", email: "user@example.com" };
    render(<ProfileSectionClient />);

    const saveButton = await screen.findByRole("button", {
      name: "saveProfile",
    });
    const displayName = screen.getByLabelText("displayNameLabel");

    expect(displayName.closest('[data-slot="card-content"]')).toBeTruthy();
    expect(document.querySelectorAll('[data-slot="field-group"]')).toHaveLength(
      1,
    );
    expect(saveButton.closest('[data-slot="card-footer"]')).toBeTruthy();
    const form = saveButton.closest("form");
    expect(form).toBeTruthy();
    expect(displayName.closest("form")).toBe(form);
    expect(
      displayName
        .closest('[data-slot="field-group"]')
        ?.closest('[data-slot="card-content"]'),
    ).toBeTruthy();
    expect(form?.querySelectorAll("form")).toHaveLength(0);
    expect(saveButton.getAttribute("type")).toBe("submit");
  });

  it("uploads a new avatar and updates the auth profile", async () => {
    mocks.currentUser = {
      uid: "user-123",
      email: "user@example.com",
    };
    render(<ProfileSectionClient />);

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    fireEvent.change(
      await screen.findByLabelText("profilePhotoChange", {
        selector: "input",
      }),
      {
        target: { files: [file] },
      },
    );
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
    render(<ProfileSectionClient />);

    const file = new File(["test"], "test.txt", { type: "text/plain" });
    fireEvent.change(
      await screen.findByLabelText("profilePhotoChange", {
        selector: "input",
      }),
      {
        target: { files: [file] },
      },
    );

    expect(mocks.toastAdd).toHaveBeenCalledWith({
      title: "profilePhotoInvalid",
      type: "error",
    });
  });

  it("applies saved preferences from the user's document", async () => {
    mocks.currentUser = { uid: "user-123" };
    mocks.locale = "es";
    mocks.readPreferences.mockResolvedValue({ locale: "es", theme: "dark" });

    render(<ProfileSectionClient />);

    await waitFor(() => expect(mocks.setTheme).toHaveBeenCalledWith("dark"));
    expect(mocks.readPreferences).toHaveBeenCalledWith("user-123");
  });

  it("synchronizes a saved Portuguese locale before revealing the profile", async () => {
    mocks.currentUser = { uid: "user-123" };
    mocks.readPreferences.mockResolvedValue({ locale: "pt-BR" });

    const { container } = render(<ProfileSectionClient />);

    await waitFor(() => expect(mocks.router.refresh).toHaveBeenCalledOnce());
    expect(document.cookie).toContain("NEXT_LOCALE=pt-BR");
    expect(container.querySelector('[data-slot="card"]')).toBeNull();
  });

  it("saves a changed theme preference and shows success toast", async () => {
    mocks.currentUser = { uid: "user-123", email: "user@example.com" };
    render(<ProfileSectionClient />);

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

  it("updates the display name and requests email verification with toast", async () => {
    mocks.currentUser = {
      uid: "user-123",
      email: "old@example.com",
      displayName: "Old Name",
    };
    render(<ProfileSectionClient />);

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
    render(<ProfileSectionClient />);

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
    render(<ProfileSectionClient />);
    const dynamicUser = {
      uid: "uid-dynamic",
      email: "dynamic@example.com",
      displayName: "Dynamic User",
    };
    mocks.currentUser = dynamicUser;
    act(() => {
      authCallback(dynamicUser);
    });
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
    render(<ProfileSectionClient />);
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
      render(<ProfileSectionClient />);
      const input = (await screen.findByLabelText("profilePhotoChange", {
        selector: "input",
      })) as HTMLInputElement;
      const file = new File(["avatar"], "avatar.png", { type: "image/png" });
      fireEvent.change(input, { target: { files: [file] } });
      fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));
      await waitFor(() =>
        expect(mocks.toastAdd).toHaveBeenCalledWith({
          title: "profileSaveError",
          type: "error",
        }),
      );
      const save = await screen.findByRole("button", { name: "saveProfile" });
      fireEvent.click(save);
      await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalled());
      expect(mocks.uploadBytes).toHaveBeenCalledTimes(2);
      await screen.findByRole("button", { name: "saveProfile" });
      fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));
      await waitFor(() => expect(mocks.toastAdd).toHaveBeenCalledTimes(3));
      expect(mocks.uploadBytes).toHaveBeenCalledTimes(2);
      expect(input.value).toBe("");
    } finally {
      log.mockRestore();
    }
  });
});
