import { beforeEach, expect, it, vi } from "vitest";
import { withUsageGuard } from "./usage";

const mocks = vi.hoisted(() => ({
  logUsage: vi.fn(),
  callable: vi.fn(),
  user: { uid: "user-1" } as { uid: string } | null,
}));
vi.mock("firebase/functions", () => ({ httpsCallable: mocks.callable }));
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseFunctions: () => "functions",
  getFirebaseUI: () => ({ get: () => ({ auth: { currentUser: mocks.user } }) }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { uid: "user-1" };
  mocks.logUsage
    .mockReset()
    .mockResolvedValue({ data: { eventId: "event-1" } });
  mocks.callable.mockReturnValue(mocks.logUsage);
});
it("calls the authenticated backend before executing the functionality", async () => {
  const operation = vi.fn(async () => {
    expect(mocks.logUsage).toHaveBeenCalledWith({
      type: "function_use",
      name: "profile.update",
    });
    return 42;
  });
  await expect(
    withUsageGuard({ type: "function_use", name: "profile.update" }, operation),
  ).resolves.toBe(42);
  expect(mocks.callable).toHaveBeenCalledWith("functions", "recordUsage", {
    timeout: 15_000,
  });
});
it("waits for the callable acknowledgment", async () => {
  let acknowledge: (() => void) | undefined;
  mocks.logUsage.mockReturnValue(
    new Promise<void>((resolve) => {
      acknowledge = resolve;
    }),
  );
  const operation = vi.fn(async () => 42);
  const result = withUsageGuard(
    { type: "function_use", name: "profile.update" },
    operation,
  );
  expect(operation).not.toHaveBeenCalled();
  acknowledge?.();
  await expect(result).resolves.toBe(42);
});
it("blocks the operation when the callable fails", async () => {
  mocks.logUsage.mockRejectedValue(new Error("offline"));
  const operation = vi.fn();
  await expect(
    withUsageGuard({ type: "function_use", name: "profile.update" }, operation),
  ).rejects.toThrow("offline");
  expect(operation).not.toHaveBeenCalled();
});
it("rejects unauthenticated usage", async () => {
  mocks.user = null;
  const operation = vi.fn();
  await expect(
    withUsageGuard({ type: "function_use", name: "profile.update" }, operation),
  ).rejects.toThrow("Authentication");
  expect(mocks.logUsage).not.toHaveBeenCalled();
  expect(operation).not.toHaveBeenCalled();
});
