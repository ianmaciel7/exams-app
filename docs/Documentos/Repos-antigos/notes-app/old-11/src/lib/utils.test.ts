import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names and resolves conflicting Tailwind utilities", () => {
    expect(cn("text-sm", "text-lg", "font-medium")).toBe("text-lg font-medium");
  });
});
