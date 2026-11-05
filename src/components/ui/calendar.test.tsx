import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Calendar } from "./calendar";

afterEach(cleanup);

describe("calendar identity", () => {
  it("preserves day buttons when parent presentation props change", () => {
    const month = new Date(2026, 0, 1);
    const view = render(<Calendar mode="single" defaultMonth={month} />);
    const day =
      view.container.querySelector<HTMLButtonElement>("button[data-day]");
    expect(day).not.toBeNull();
    day?.focus();
    view.rerender(
      <Calendar mode="single" defaultMonth={month} className="border" />,
    );
    expect(
      view.container.querySelector(`[data-day="${day?.dataset.day}"]`),
    ).toBe(day);
    expect(document.activeElement).toBe(day);
  });
});
