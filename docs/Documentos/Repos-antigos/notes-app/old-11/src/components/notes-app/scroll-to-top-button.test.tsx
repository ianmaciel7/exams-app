import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScrollToTopButton } from "./scroll-to-top-button";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ScrollToTopButton", () => {
  afterEach(cleanup);

  it("exposes an accessible name and forwards clicks", () => {
    const onClick = vi.fn();
    render(<ScrollToTopButton onClick={onClick} />);

    const button = screen.getByRole("button", { name: "scrollToTop" });
    expect(button.getAttribute("data-slot")).toBe("scroll-to-top-button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
