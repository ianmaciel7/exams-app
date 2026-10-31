// cspell:ignore rtdb firebasedatabase firebaseio europe googleusercontent
import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, createNonce } from "./csp";

function directives(policy: string) {
  return new Map(
    policy.split("; ").map((directive) => {
      const [name, ...sources] = directive.split(" ");
      return [name, sources] as const;
    }),
  );
}

describe("createNonce", () => {
  it("returns a fresh base64 value with 128 bits of entropy", () => {
    const nonce = createNonce();
    expect(atob(nonce)).toHaveLength(16);
    expect(createNonce()).not.toBe(nonce);
  });
});

describe("buildContentSecurityPolicy", () => {
  const env = {
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-test.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_DATABASE_URL:
      "https://demo-test-default-rtdb.europe-west1.firebasedatabase.app",
    NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  };

  it("allows scripts only through the nonce and strict-dynamic in production", () => {
    const policy = directives(
      buildContentSecurityPolicy({ nonce: "abc", isDevelopment: false, env }),
    );
    expect(policy.get("script-src")).toEqual([
      "'self'",
      "'nonce-abc'",
      "'strict-dynamic'",
      "https:",
      "'unsafe-inline'",
    ]);
    expect(policy.get("style-src")).toEqual(["'self'", "'nonce-abc'"]);
    expect(policy.get("object-src")).toEqual(["'none'"]);
    expect(policy.get("base-uri")).toEqual(["'none'"]);
    expect(policy.get("frame-ancestors")).toEqual(["'self'"]);
    expect(policy.get("worker-src")).toEqual([
      "'self'",
      "https://www.gstatic.com/firebasejs/",
    ]);
  });

  it("loads profile photos from Firebase Storage and Google accounts", () => {
    const production = directives(
      buildContentSecurityPolicy({ nonce: "abc", isDevelopment: false, env }),
    );
    expect(production.get("img-src")).toEqual([
      "'self'",
      "blob:",
      "data:",
      "https://firebasestorage.googleapis.com",
      "https://lh3.googleusercontent.com",
    ]);

    const development = directives(
      buildContentSecurityPolicy({
        nonce: "abc",
        isDevelopment: true,
        env: { NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:9199" },
      }),
    );
    expect(development.get("img-src")).toContain("http://127.0.0.1:9199");
    expect(development.get("img-src")).not.toContain("ws://127.0.0.1:9199");
  });

  it("allows the Firebase Auth domain and database without emulators in production", () => {
    const policy = directives(
      buildContentSecurityPolicy({ nonce: "abc", isDevelopment: false, env }),
    );
    expect(policy.get("frame-src")).toContain(
      "https://demo-test.firebaseapp.com",
    );
    expect(policy.get("connect-src")).toEqual(
      expect.arrayContaining([
        "https://demo-test.firebaseapp.com",
        "https://demo-test-default-rtdb.europe-west1.firebasedatabase.app",
        "wss://demo-test-default-rtdb.europe-west1.firebasedatabase.app",
      ]),
    );
    expect(policy.get("connect-src")).not.toContain("http://127.0.0.1:9099");
  });

  it("adds eval, inline styles and emulator origins only in development", () => {
    const policy = directives(
      buildContentSecurityPolicy({ nonce: "abc", isDevelopment: true, env }),
    );
    expect(policy.get("script-src")).toContain("'unsafe-eval'");
    expect(policy.get("style-src")).toEqual(["'self'", "'unsafe-inline'"]);
    expect(policy.get("connect-src")).toEqual(
      expect.arrayContaining(["http://127.0.0.1:9099", "ws://127.0.0.1:9099"]),
    );
    expect(policy.get("frame-src")).toContain("http://127.0.0.1:9099");
    expect(policy.get("frame-src")).not.toContain("ws://127.0.0.1:9099");
  });

  it("ignores missing or malformed origins", () => {
    const policy = buildContentSecurityPolicy({
      nonce: "abc",
      isDevelopment: true,
      env: { NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "http://[bad" },
    });
    expect(policy).not.toContain("undefined");
    expect(policy).not.toContain("[bad");
  });
});
