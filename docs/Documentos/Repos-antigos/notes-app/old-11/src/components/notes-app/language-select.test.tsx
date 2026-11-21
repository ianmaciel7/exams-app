import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "@/messages/en.json";
import { LanguageSelect } from "./language-select";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

function renderWithIntl(ui: React.ReactNode, locale = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("LanguageSelect", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders language select dropdown with current language", () => {
    renderWithIntl(<LanguageSelect />);

    const selectTrigger = screen.getByTestId("language-select");
    expect(selectTrigger).toBeDefined();
    expect(screen.getByText("English")).toBeDefined();
  });

  it("opens options and triggers router refresh on language selection", () => {
    renderWithIntl(<LanguageSelect />);

    const selectTrigger = screen.getByTestId("language-select");
    fireEvent.click(selectTrigger);

    const ptOption = screen.getByRole("option", { name: "Português (Brasil)" });
    expect(ptOption).toBeDefined();
    expect(screen.getByRole("option", { name: "Español" })).toBeDefined();

    fireEvent.pointerDown(ptOption);
    fireEvent.pointerUp(ptOption);
    fireEvent.click(ptOption);

    expect(mockRefresh).toHaveBeenCalled();
  });
});
