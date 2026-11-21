import { expect, test, vi } from "vitest";
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
