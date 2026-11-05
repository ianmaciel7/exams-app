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

it("sends the event through the existing authenticated callable contract", async () => {
  const event = { type: "function_use", name: "profile.update" } as const;
  await expect(trackEvent(event)).resolves.toBeUndefined();
  expect(mocks.callable).toHaveBeenCalledWith("functions", "recordUsage", {
    timeout: 15_000,
  });
  expect(mocks.logUsage).toHaveBeenCalledExactlyOnceWith(event);
});

it("waits for acknowledgment before resolving", async () => {
  const acknowledgment = Promise.withResolvers<void>();
  mocks.logUsage.mockReturnValue(acknowledgment.promise);
  const finished = vi.fn();
  const pending = trackEvent({ type: "screen_view", name: "/profile" }).then(
    finished,
  );
  await Promise.resolve();
  expect(finished).not.toHaveBeenCalled();
  acknowledgment.resolve();
  await pending;
  expect(finished).toHaveBeenCalledOnce();
});

it("propagates callable failure to the caller", async () => {
  mocks.logUsage.mockRejectedValue(new Error("offline"));
  await expect(
    trackEvent({ type: "function_use", name: "profile.update" }),
  ).rejects.toThrow("offline");
});

it("rejects unauthenticated events before calling Firebase", async () => {
  mocks.user = null;
  await expect(
    trackEvent({ type: "screen_view", name: "/profile" }),
  ).rejects.toThrow("Authentication");
  expect(mocks.callable).not.toHaveBeenCalled();
});
