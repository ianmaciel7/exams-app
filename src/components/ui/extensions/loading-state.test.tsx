import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LoadingState } from "./loading-state";

afterEach(cleanup);

it("renders an empty, named marker that the global indicator reacts to", () => {
  const { container } = render(<LoadingState boundary="profile-preferences" />);
  const marker = container.querySelector('[data-slot="loading-state"]');
  expect(marker?.getAttribute("data-loading-boundary")).toBe(
    "profile-preferences",
  );
  expect(marker?.childElementCount).toBe(0);
});
