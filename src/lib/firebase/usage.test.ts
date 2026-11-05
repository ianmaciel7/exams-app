import { beforeEach, expect, it, vi } from "vitest";
import { trackEvent } from "./usage";

const mocks = vi.hoisted(() => ({
  logUsage: vi.fn(),
  callable: vi.fn(),
  user: { uid: "user-1" } as { uid: string } | null,
}));
vi.mock("firebase/functions", () => ({ httpsCallable: mocks.callable }));
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseFunctions: () => "functions",
  getFirebaseAuthUser: () => mocks.user,
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { uid: "user-1" };
  mocks.logUsage
    .mockReset()
    .mockResolvedValue({ data: { eventId: "event-1" } });
  mocks.callable.mockReturnValue(mocks.logUsage);
});
it.each([
  { type: "function_use", name: "profile.update" },
  { type: "screen_view", name: "/profile" },
] as const)(
  "sends the $type event to the authenticated callable",
  async (event) => {
    await expect(trackEvent(event)).resolves.toBeUndefined();
    expect(mocks.logUsage).toHaveBeenCalledExactlyOnceWith(event);
    expect(mocks.callable).toHaveBeenCalledWith("functions", "recordUsage", {
      timeout: 15_000,
    });
  },
);
it("waits for the callable acknowledgment", async () => {
  const deferred = Promise.withResolvers<void>();
  mocks.logUsage.mockReturnValue(deferred.promise);
  const settled = vi.fn();
  const result = trackEvent({
    type: "function_use",
    name: "profile.update",
  }).then(settled);
  await Promise.resolve();
  expect(settled).not.toHaveBeenCalled();
  deferred.resolve();
  await result;
  expect(settled).toHaveBeenCalledOnce();
});
it("propagates callable failures", async () => {
  mocks.logUsage.mockRejectedValue(new Error("offline"));
  await expect(
    trackEvent({ type: "function_use", name: "profile.update" }),
  ).rejects.toThrow("offline");
});
it("rejects unauthenticated usage before creating the callable", async () => {
  mocks.user = null;
  await expect(
    trackEvent({ type: "function_use", name: "profile.update" }),
  ).rejects.toThrow("Authentication");
  expect(mocks.callable).not.toHaveBeenCalled();
  expect(mocks.logUsage).not.toHaveBeenCalled();
});
