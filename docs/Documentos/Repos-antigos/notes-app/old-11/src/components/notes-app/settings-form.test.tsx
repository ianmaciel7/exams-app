import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsForm } from "@/components/notes-app/settings-form";
import messages from "@/messages/en.json";

const mockSetTheme = vi.fn();
let mockResolvedTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function renderForm() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SettingsForm />
    </NextIntlClientProvider>
  );
}

describe("SettingsForm", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockResolvedTheme = "light";
  });

  it("renders theme and language controls", () => {
    renderForm();

    expect(screen.getByRole("switch")).toBeDefined();
    expect(screen.getByTestId("language-select")).toBeDefined();
  });

  it("switches to dark theme", () => {
    renderForm();

    fireEvent.click(screen.getByRole("switch"));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("switches back to light theme", () => {
    mockResolvedTheme = "dark";
    renderForm();

    fireEvent.click(screen.getByRole("switch"));

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
