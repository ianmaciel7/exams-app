import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  onLog: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  onLog: mocks.onLog,
}));

import { formatFirebaseLog } from "./instrumentation-client";

describe("formatFirebaseLog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs to console.error when level is 'error'", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    formatFirebaseLog({
      level: "error",
      message: "auth/invalid-credential",
      type: "auth",
    });

    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledWith(
      "[Firebase:auth] auth/invalid-credential",
    );
    expect(warnSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("logs to console.warn when level is 'warn'", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    formatFirebaseLog({
      level: "warn",
      message: "Missing index on collection query",
      type: "firestore",
    });

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      "[Firebase:firestore] Missing index on collection query",
    );
    expect(errorSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("logs to console.debug when level is 'info'", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    formatFirebaseLog({
      level: "info",
      message: "Client initialized",
      type: "app",
    });

    expect(debugSpy).toHaveBeenCalledOnce();
    expect(debugSpy).toHaveBeenCalledWith("[Firebase:app] Client initialized");
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs to console.debug when level is 'debug'", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    formatFirebaseLog({
      level: "debug",
      message: "Cache hit for document users/123",
      type: "firestore",
    });

    expect(debugSpy).toHaveBeenCalledOnce();
    expect(debugSpy).toHaveBeenCalledWith(
      "[Firebase:firestore] Cache hit for document users/123",
    );
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs to console.debug when level is 'verbose'", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    formatFirebaseLog({
      level: "verbose",
      message: "Chunk upload progress 50%",
      type: "storage",
    });

    expect(debugSpy).toHaveBeenCalledOnce();
    expect(debugSpy).toHaveBeenCalledWith(
      "[Firebase:storage] Chunk upload progress 50%",
    );
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs to console.debug for other unrecognized levels", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    formatFirebaseLog({
      level: "trace",
      message: "Low-level trace packet",
      type: "network",
    });

    expect(debugSpy).toHaveBeenCalledOnce();
    expect(debugSpy).toHaveBeenCalledWith(
      "[Firebase:network] Low-level trace packet",
    );
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("formats the output string as [Firebase:type] message", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    formatFirebaseLog({
      level: "debug",
      type: "functions",
      message: "Execution took 120ms",
    });

    expect(debugSpy).toHaveBeenCalledWith(
      "[Firebase:functions] Execution took 120ms",
    );
  });

  it("formats empty message correctly", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    formatFirebaseLog({
      level: "info",
      type: "database",
      message: "",
    });

    expect(debugSpy).toHaveBeenCalledWith("[Firebase:database] ");
  });
});

describe("onLog registration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("registers formatFirebaseLog with level error in non-development environment", async () => {
    mocks.onLog.mockClear();
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");

    const mod = await import("./instrumentation-client");

    expect(mocks.onLog).toHaveBeenCalledOnce();
    expect(mocks.onLog).toHaveBeenCalledWith(mod.formatFirebaseLog, {
      level: "error",
    });
  });

  it("registers formatFirebaseLog with level debug in development environment", async () => {
    mocks.onLog.mockClear();
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");

    const mod = await import("./instrumentation-client");

    expect(mocks.onLog).toHaveBeenCalledOnce();
    expect(mocks.onLog).toHaveBeenCalledWith(mod.formatFirebaseLog, {
      level: "debug",
    });
  });
});
