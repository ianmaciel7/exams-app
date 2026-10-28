// cspell:ignore gstatic firebasejs
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const workerSource = readFileSync("public/firebase-auth-sw.js", "utf8").replace(
  /^import[\s\S]*?from "https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+";\r?\n/gm,
  "",
);

function createWorker(getIdToken: () => Promise<string>) {
  const handlers = new Map<string, (event: unknown) => void>();
  const fetchRequest = vi.fn(async (_request: Request) => new Response("ok"));

  runInNewContext(workerSource, {
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        handlers.set(name, handler),
    },
    initializeApp: () => ({}),
    initializeAuth: () => ({}),
    indexedDBLocalPersistence: {},
    onAuthStateChanged: (
      _auth: unknown,
      callback: (user: { uid: string }) => void,
    ) => {
      queueMicrotask(() => callback({ uid: "u1" }));
      return () => {};
    },
    connectAuthEmulator: () => {},
    getIdToken,
    fetch: fetchRequest,
    Headers,
    Request,
    URL,
  });

  handlers.get("message")?.({
    data: { type: "firebase-config", config: { firebase: {} } },
  });

  async function navigate() {
    const request = new Request("https://example.test/profile", {
      headers: { RSC: "1" },
    });
    let response: Promise<Response> | undefined;
    handlers.get("fetch")?.({
      request,
      respondWith: (value: Promise<Response>) => {
        response = value;
      },
    });
    if (!response) throw new Error("Worker did not intercept navigation");
    await response;
    return { request, forwarded: fetchRequest.mock.lastCall?.[0] };
  }

  function notifySession(uid: string | null) {
    const acknowledge = vi.fn();
    handlers.get("message")?.({
      data: { type: "firebase-auth-session", uid },
      ports: [{ postMessage: acknowledge }],
    });
    return acknowledge;
  }

  return { navigate, fetchRequest, notifySession };
}

describe("Firebase auth service worker", () => {
  it("forwards refreshed credentials on successful navigation", async () => {
    const { navigate, fetchRequest } = createWorker(
      vi.fn().mockResolvedValue("fresh-token"),
    );
    const { forwarded } = await navigate();
    expect(fetchRequest).toHaveBeenCalledOnce();
    expect(forwarded?.headers.get("Authorization")).toBe("Bearer fresh-token");
    expect(forwarded?.headers.get("x-firebase-auth-bridge")).toBe("1");
  });

  it("does not retry a failed network request without authorization", async () => {
    const { navigate, fetchRequest } = createWorker(
      vi.fn().mockResolvedValue("fresh-token"),
    );
    fetchRequest.mockRejectedValue(new Error("network unavailable"));
    await expect(navigate()).rejects.toThrow("network unavailable");
    expect(fetchRequest).toHaveBeenCalledOnce();
  });

  it("forwards the original request without a bridge token on refresh failure", async () => {
    const { navigate, fetchRequest } = createWorker(
      vi.fn().mockRejectedValue(new Error("auth/network-request-failed")),
    );
    const { request, forwarded } = await navigate();
    expect(fetchRequest).toHaveBeenCalledOnce();
    expect(forwarded).toBe(request);
    expect(forwarded?.headers.has("Authorization")).toBe(false);
    expect(forwarded?.headers.has("x-firebase-auth-bridge")).toBe(false);
  });
  it("does not forward stale credentials after an explicit sign-out", async () => {
    const getToken = vi.fn().mockResolvedValue("stale-token");
    const { navigate, notifySession } = createWorker(getToken);
    const acknowledge = notifySession(null);
    expect(acknowledge).toHaveBeenCalledWith({
      type: "firebase-auth-session-ack",
    });
    const { request, forwarded } = await navigate();
    expect(forwarded).toBe(request);
    expect(forwarded?.headers.has("Authorization")).toBe(false);
    expect(getToken).not.toHaveBeenCalled();
  });

  it("never forwards another user's token after account switching", async () => {
    const getToken = vi.fn().mockResolvedValue("user-one-token");
    const { navigate, notifySession } = createWorker(getToken);

    notifySession("u2");
    const { forwarded: staleRequest } = await navigate();
    expect(staleRequest?.headers.has("Authorization")).toBe(false);

    notifySession("u1");
    const { forwarded: matchingRequest } = await navigate();
    expect(matchingRequest?.headers.get("Authorization")).toBe(
      "Bearer user-one-token",
    );
  });
});
