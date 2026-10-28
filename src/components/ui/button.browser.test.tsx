import "@/app/globals.css";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "./button";

test("fires onClick when clicked and can receive keyboard focus", async () => {
  const onClick = vi.fn();
  const screen = await render(<Button onClick={onClick}>Save</Button>);
  const button = screen.getByRole("button", { name: "Save" });

  await button.click();
  expect(onClick).toHaveBeenCalledTimes(1);

  await button.element().focus();
  await expect.element(button).toHaveFocus();
});

test("does not fire onClick while disabled", async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Button disabled onClick={onClick}>
      Save
    </Button>,
  );
  const button = screen.getByRole("button", { name: "Save" });

  await expect.element(button).toBeDisabled();
  await button.click({ force: true });

  expect(onClick).not.toHaveBeenCalled();
});

test("reflows responsively across mobile (390px), tablet (768px), and desktop (1280px) viewports", async () => {
  // Mobile viewport (390px)
  await page.viewport(390, 844);
  const screen = await render(
    <div className="w-full p-4">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button data-testid="btn-primary" className="w-full sm:w-auto">
          Primary Action
        </Button>
        <Button
          data-testid="btn-secondary"
          variant="outline"
          className="w-full sm:w-auto"
        >
          Secondary Action
        </Button>
      </div>
    </div>,
  );

  const primary = screen.getByTestId("btn-primary").element();
  const secondary = screen.getByTestId("btn-secondary").element();

  let primaryRect = primary.getBoundingClientRect();
  let secondaryRect = secondary.getBoundingClientRect();

  // On mobile (390px), buttons expand full-width and stack vertically
  expect(primaryRect.width).toBeGreaterThan(300);
  expect(secondaryRect.width).toBeGreaterThan(300);
  expect(secondaryRect.top).toBeGreaterThanOrEqual(primaryRect.bottom - 1);

  // Tablet viewport (768px)
  await page.viewport(768, 1024);
  primaryRect = primary.getBoundingClientRect();
  secondaryRect = secondary.getBoundingClientRect();

  // Reflows side-by-side with intrinsic width
  expect(Math.abs(primaryRect.top - secondaryRect.top)).toBeLessThan(5);
  expect(secondaryRect.left).toBeGreaterThanOrEqual(primaryRect.right - 1);
  expect(primaryRect.width).toBeLessThan(250);

  // Desktop viewport (1280px)
  await page.viewport(1280, 800);
  primaryRect = primary.getBoundingClientRect();
  secondaryRect = secondary.getBoundingClientRect();

  expect(Math.abs(primaryRect.top - secondaryRect.top)).toBeLessThan(5);
  expect(secondaryRect.left).toBeGreaterThanOrEqual(primaryRect.right - 1);
});

test("complies with WCAG 2.2 SC 2.5.8 Touch Target minimum size (>= 24x24px) across sizes", async () => {
  await page.viewport(390, 844);
  const screen = await render(
    <div className="flex flex-wrap gap-4 p-4">
      <Button data-testid="btn-default" size="default">
        Default
      </Button>
      <Button data-testid="btn-sm" size="sm">
        Small
      </Button>
      <Button data-testid="btn-lg" size="lg">
        Large
      </Button>
      <Button data-testid="btn-icon" size="icon" aria-label="Icon action">
        ★
      </Button>
    </div>,
  );

  for (const testId of ["btn-default", "btn-sm", "btn-lg", "btn-icon"]) {
    const el = screen.getByTestId(testId).element();
    const rect = el.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(24);
    expect(rect.height).toBeGreaterThanOrEqual(24);
  }
});
