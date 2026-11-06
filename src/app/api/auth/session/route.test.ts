import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: new Map<string, { value: string; options?: unknown }>(),
  createSessionCookie: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (name: string, value: string, options?: unknown) => {
      mocks.cookies.set(name, { value, options });
    },
    delete: (name: string) => {
      mocks.cookies.delete(name);
    },
  }),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    createSessionCookie: mocks.createSessionCookie,
  }),
}));

import { NextRequest } from "next/server";
import { DELETE, POST } from "./route";

describe("/api/auth/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.clear();
  });

  describe("POST", () => {
    it("rejects missing idToken with status 400", async () => {
      const request = new NextRequest("http://localhost/api/auth/session", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(mocks.createSessionCookie).not.toHaveBeenCalled();
    });

    it("mints and sets __session cookie for valid idToken", async () => {
      mocks.createSessionCookie.mockResolvedValue("mocked-session-cookie");
      const request = new NextRequest("http://localhost/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ idToken: "valid-token-123" }),
      });
      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mocks.createSessionCookie).toHaveBeenCalledWith(
        "valid-token-123",
        expect.objectContaining({ expiresIn: 5 * 24 * 60 * 60 * 1000 }),
      );
      expect(mocks.cookies.get("__session")?.value).toBe(
        "mocked-session-cookie",
      );
    });

    it("returns status 401 and deletes the session cookie when createSessionCookie fails", async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      try {
        mocks.cookies.set("__session", { value: "old-revoked-cookie" });
        mocks.createSessionCookie.mockRejectedValue(new Error("invalid token"));
        const request = new NextRequest("http://localhost/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ idToken: "bad-token" }),
        });
        const response = await POST(request);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({
          error: "Failed to create session",
          code: "unknown",
        });
        expect(mocks.cookies.has("__session")).toBe(false);
      } finally {
        log.mockRestore();
      }
    });

    it("logs specific diagnostic guidance when auth/user-not-found occurs in emulator mode", async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const previousHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
      try {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
        const firebaseError = Object.assign(
          new Error("There is no user record"),
          { code: "auth/user-not-found" },
        );
        mocks.createSessionCookie.mockRejectedValue(firebaseError);
        const request = new NextRequest("http://localhost/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ idToken: "token-from-other-project" }),
        });
        const response = await POST(request);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.code).toBe("auth/user-not-found");
        expect(log).toHaveBeenCalledWith(
          expect.stringContaining("User not found in emulator project"),
        );
      } finally {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = previousHost;
        log.mockRestore();
      }
    });
  });

  describe("DELETE", () => {
    it("clears the __session cookie", async () => {
      mocks.cookies.set("__session", { value: "old-cookie" });
      const response = await DELETE();
      expect(response.status).toBe(200);
      expect(mocks.cookies.has("__session")).toBe(false);
    });
  });
});
