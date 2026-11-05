import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ProfileAction,
  ProfileGateway,
  ProfileSnapshot,
} from "../_lib/definitions";
import { ProfileEmailForm } from "./profile-email-form";
import { ProfileForm } from "./profile-form";
import { ProfileGatewayProviderClient } from "./profile-gateway-provider-client";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  setTheme: vi.fn(),
  toastAdd: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme: mocks.setTheme }),
}));

vi.mock("@/hooks/use-navigation", () => ({
  useNavigation: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/lib/toast", () => ({ toast: { add: mocks.toastAdd } }));
vi.mock("@/components/ui/toast", () => ({ toast: { add: mocks.toastAdd } }));

const snapshot: ProfileSnapshot = {
  photoURL: null,
  values: {
    displayName: "Ada",
    email: "ada@example.com",
    locale: "en",
    theme: "system",
  },
};

const gateway: ProfileGateway = {
  changeEmail: vi.fn(async () => {}),
  refreshUser: vi.fn(async () => {}),
};

/** Fake Action: the server result, with the submitted values saved. */
function savingAction() {
  return vi.fn<ProfileAction>(async (previous, formData) => ({
    values: {
      ...snapshot.values,
      displayName: String(formData.get("displayName")),
      theme:
        formData.get("theme") === "dark"
          ? ("dark" as const)
          : ("system" as const),
    },
    photoURL: null,
    hasError: false,
    savedCount: (previous?.savedCount ?? 0) + 1,
  }));
}

function renderForm(action: ProfileAction) {
  return render(
    <ProfileGatewayProviderClient gateway={gateway}>
      <ProfileForm action={action} initialValues={snapshot} />
    </ProfileGatewayProviderClient>,
  );
}

async function clickSave() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "saveProfile" }));
  });
}

describe("ProfileForm", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows the injected initial values and a read-only e-mail", () => {
    renderForm(savingAction());
    expect(screen.getByDisplayValue("Ada")).toBeTruthy();
    const email = screen.getByDisplayValue("ada@example.com");
    expect((email as HTMLInputElement).readOnly).toBe(true);
  });

  it("calls the injected Action and runs the browser side effects", async () => {
    const action = savingAction();
    renderForm(action);
    fireEvent.change(screen.getByDisplayValue("Ada"), {
      target: { value: "Grace" },
    });
    await clickSave();

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(action.mock.calls[0][0]).toMatchObject({ savedCount: 0 });
    expect(mocks.toastAdd).toHaveBeenCalledWith({
      title: "profileSaved",
      type: "success",
    });
    expect(gateway.refreshUser).toHaveBeenCalled();
  });

  it("shows an alert and no toast when the Action fails", async () => {
    const action: ProfileAction = async (_previous, formData) => ({
      values: {
        ...snapshot.values,
        displayName: String(formData.get("displayName")),
      },
      photoURL: null,
      hasError: true,
      savedCount: 0,
    });
    renderForm(action);
    await clickSave();

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe("profileSaveError"),
    );
    expect(mocks.toastAdd).not.toHaveBeenCalled();
  });

  it("applies the stored theme and locale when the form mounts", () => {
    render(
      <ProfileGatewayProviderClient gateway={gateway}>
        <ProfileForm
          action={savingAction()}
          initialValues={{
            ...snapshot,
            values: { ...snapshot.values, theme: "dark", locale: "es" },
          }}
        />
      </ProfileGatewayProviderClient>,
    );
    expect(mocks.setTheme).toHaveBeenCalledWith("dark");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("applies the saved theme after a failed save followed by a retry", async () => {
    let attempt = 0;
    const action: ProfileAction = async (_previous, formData) => {
      attempt += 1;
      return {
        values: { ...snapshot.values, theme: "dark" },
        photoURL: null,
        hasError: attempt === 1,
        savedCount: attempt,
      };
    };
    renderForm(action);
    await clickSave();
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    mocks.setTheme.mockClear();
    await clickSave();

    await waitFor(() => expect(mocks.setTheme).toHaveBeenCalledWith("dark"));
  });

  it("rejects an unsupported avatar before calling the Action", () => {
    const action = savingAction();
    renderForm(action);
    const input = document.querySelector<HTMLInputElement>("input[type=file]");
    fireEvent.change(input as HTMLInputElement, {
      target: { files: [new File(["x"], "a.txt", { type: "text/plain" })] },
    });
    expect(mocks.toastAdd).toHaveBeenCalledWith({
      title: "profilePhotoInvalid",
      type: "error",
    });
    expect(action).not.toHaveBeenCalled();
  });

  it("keeps a picked avatar after a failed save and sends it again", async () => {
    const calls: (FormDataEntryValue | null)[] = [];
    let attempt = 0;
    const action: ProfileAction = async (_previous, formData) => {
      calls.push(formData.get("avatar"));
      attempt += 1;
      return {
        values: snapshot.values,
        photoURL: null,
        hasError: attempt === 1,
        savedCount: attempt,
      };
    };
    renderForm(action);
    const input = document.querySelector<HTMLInputElement>(
      "input[type=file]",
    ) as HTMLInputElement;
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    await clickSave();
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    await clickSave();

    await waitFor(() => expect(calls).toHaveLength(2));
    expect(calls[0]).toBeInstanceOf(File);
    expect(calls[1]).toBeInstanceOf(File);
  });
});

describe("ProfileEmailForm", () => {
  afterEach(cleanup);

  it("sends the trimmed address to the injected Action", async () => {
    const action = vi.fn(async () => {});
    render(<ProfileEmailForm email="ada@example.com" changeEmail={action} />);
    fireEvent.change(screen.getByDisplayValue("ada@example.com"), {
      target: { value: " new@example.com " },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "changeEmail" }));
    });

    await waitFor(() => expect(action).toHaveBeenCalledWith("new@example.com"));
  });
});
