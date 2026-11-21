import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SidebarMenuSkeleton } from "./sidebar";

describe("SidebarMenuSkeleton", () => {
  it("renders a deterministic width across independent server renders", () => {
    const first = renderToStaticMarkup(<SidebarMenuSkeleton />);
    const second = renderToStaticMarkup(<SidebarMenuSkeleton />);
    expect(second).toBe(first);
    expect(first).toContain("70%");
  });
});
