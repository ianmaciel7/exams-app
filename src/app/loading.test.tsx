import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import ProtectedLoading from "./(protected)/loading";
import PublicLoading from "./(public)/loading";
import Loading from "./loading";

afterEach(cleanup);

it.each([
  ["root-route", Loading],
  ["public-layout", PublicLoading],
  ["protected-layout", ProtectedLoading],
] as const)(
  "marks the %s loading boundary without its own spinner",
  (boundary, Component) => {
    const { container } = render(<Component />);
    const marker = container.querySelector('[data-slot="loading-state"]');
    expect(marker?.getAttribute("data-loading-boundary")).toBe(boundary);
    expect(container.querySelector('[role="status"]')).toBeNull();
  },
);
