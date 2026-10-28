import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const embla = vi.hoisted(() => ({
  api: {
    canScrollPrev: vi.fn(() => true),
    canScrollNext: vi.fn(() => true),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [() => {}, embla.api],
}));

import { Carousel } from "./carousel";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Carousel", () => {
  it("removes both event listeners when unmounted", () => {
    const { unmount } = render(<Carousel>Slides</Carousel>);
    expect(embla.api.on).toHaveBeenCalledWith("reInit", expect.any(Function));
    expect(embla.api.on).toHaveBeenCalledWith("select", expect.any(Function));
    unmount();
    expect(embla.api.off).toHaveBeenCalledWith("reInit", expect.any(Function));
    expect(embla.api.off).toHaveBeenCalledWith("select", expect.any(Function));
    expect(embla.api.off).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["horizontal", "ArrowLeft", "ArrowRight", "ArrowUp"],
    ["vertical", "ArrowUp", "ArrowDown", "ArrowLeft"],
  ] as const)(
    "navigates the %s axis without intercepting the other axis",
    (orientation, previous, next, unrelated) => {
      const { getByRole } = render(
        <Carousel orientation={orientation}>Slides</Carousel>,
      );
      const region = getByRole("region");
      fireEvent.keyDown(region, { key: previous });
      fireEvent.keyDown(region, { key: next });
      fireEvent.keyDown(region, { key: unrelated });
      expect(embla.api.scrollPrev).toHaveBeenCalledTimes(1);
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    },
  );
});
