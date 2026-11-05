import "@/app/globals.css";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Form } from "@/components/ui/extensions/form";
import { ProfileEmailDialog } from "./profile-email-dialog";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/lib/toast", () => ({ toast: { add: vi.fn() } }));
const { changeEmail } = vi.hoisted(() => ({
  changeEmail: vi.fn(async (_email: string) => {}),
}));
vi.mock("@/lib/auth", () => ({ sendEmailChangeVerification: changeEmail }));

test.each([390, 1280])(
  "keeps email changes in a keyboard-accessible portal at %spx",
  async (width) => {
    await page.viewport(width, 844);
    const saveProfile = vi.fn();
    changeEmail.mockClear();
    await render(
      <Form action={saveProfile}>
        <ProfileEmailDialog email="ada@example.com" />
      </Form>,
    );
    const trigger = page.getByRole("button", { name: "changeEmailButton" });
    trigger.element().focus();
    await userEvent.keyboard("{Enter}");
    const dialog = page.getByRole("dialog", { name: "changeEmail" });
    const input = page.getByRole("textbox", { name: "newEmailLabel" });
    await expect.element(input).toHaveFocus();
    expect(document.querySelector("form form")).toBeNull();
    expect(dialog.element().getBoundingClientRect().width).toBeLessThan(width);
    await userEvent.tab({ shift: true });
    await expect
      .element(page.getByRole("button", { name: "cancelEmailChange" }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await input.fill("new@example.com");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => changeEmail.mock.calls.length).toBe(1);
    expect(changeEmail).toHaveBeenCalledWith("new@example.com");
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
    expect(saveProfile).not.toHaveBeenCalled();
  },
);
