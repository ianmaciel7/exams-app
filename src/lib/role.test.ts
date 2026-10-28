import { describe, expect, it } from "vitest";
import { hasRole, readUserRole } from "./role";

describe("readUserRole", () => {
  it("accepts known roles and defaults everything else to user", () => {
    expect(readUserRole({ role: "admin" })).toBe("admin");
    expect(readUserRole({ role: "user" })).toBe("user");
    for (const role of [
      undefined,
      null,
      "ADMIN",
      "owner",
      1,
      true,
      ["admin"],
    ]) {
      expect(readUserRole({ role })).toBe("user");
    }
    expect(readUserRole({})).toBe("user");
  });
});

describe("hasRole", () => {
  it("ranks admin above user", () => {
    expect(hasRole("admin", "user")).toBe(true);
    expect(hasRole("admin", "admin")).toBe(true);
    expect(hasRole("user", "user")).toBe(true);
    expect(hasRole("user", "admin")).toBe(false);
  });
});
