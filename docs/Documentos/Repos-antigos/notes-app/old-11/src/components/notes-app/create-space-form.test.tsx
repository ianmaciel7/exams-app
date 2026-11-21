import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "@/messages/en.json";
import { CreateSpaceForm } from "./create-space-form";

function renderWithIntl(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("CreateSpaceForm", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders form fields and handles space creation submission", async () => {
    const onSubmitSpace = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();

    renderWithIntl(
      <CreateSpaceForm onSubmitSpace={onSubmitSpace} onCancel={onCancel} />
    );

    expect(screen.getByTestId("create-space-form")).toBeDefined();
    expect(screen.getByLabelText("Space Name")).toBeDefined();
    expect(
      screen.getByTestId("create-space-icon-field-selector")
    ).toBeDefined();

    const nameInput = screen.getByTestId("create-space-name-field-input");
    const bookIconBtn = screen.getByTestId("create-space-icon-field-btn-book");
    const submitBtn = screen.getByTestId("create-space-form-footer-submit");

    fireEvent.change(nameInput, { target: { value: "Engineering Notes" } });
    fireEvent.click(bookIconBtn);
    fireEvent.click(submitBtn);

    expect(onSubmitSpace).toHaveBeenCalledWith("Engineering Notes", "book");
  });

  it("handles cancel button click", () => {
    const onSubmitSpace = vi.fn();
    const onCancel = vi.fn();

    renderWithIntl(
      <CreateSpaceForm onSubmitSpace={onSubmitSpace} onCancel={onCancel} />
    );

    const cancelBtn = screen.getByTestId("create-space-form-footer-cancel");
    fireEvent.click(cancelBtn);

    expect(onCancel).toHaveBeenCalled();
  });

  it("shows error if submitting with empty name", async () => {
    const onSubmitSpace = vi.fn();

    renderWithIntl(<CreateSpaceForm onSubmitSpace={onSubmitSpace} />);

    const nameInput = screen.getByTestId("create-space-name-field-input");
    const submitBtn = screen.getByTestId("create-space-form-footer-submit");

    fireEvent.change(nameInput, { target: { value: "   " } });
    fireEvent.click(submitBtn);

    expect(onSubmitSpace).not.toHaveBeenCalled();
  });
});
