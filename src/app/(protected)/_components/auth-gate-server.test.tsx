import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const verifySessionMock = vi.fn();
vi.mock("../_lib/dal", () => ({
  verifySession: () => verifySessionMock(),
}));

import { AuthGateServer } from "./auth-gate-server";

describe("AuthGateServer", () => {
  it("invokes verifySession and returns null", async () => {
    verifySessionMock.mockResolvedValueOnce(undefined);
    const result = await AuthGateServer({});
    expect(verifySessionMock).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});
