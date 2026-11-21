import { onLog, setLogLevel } from "firebase/app";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCapturedErrorsForTest } from "./capture";
import { handleFirebaseLog, installFirebaseLogCapture } from "./firebase-logs";

vi.mock("firebase/app", () => ({ onLog: vi.fn(), setLogLevel: vi.fn() }));

describe("firebase log capture", () => {
  beforeEach(() => {
    resetCapturedErrorsForTest();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports SDK logs as warnings so the dev overlay stays closed", () => {
    handleFirebaseLog({
      level: "error",
      message: "Could not reach Cloud Firestore backend.",
      args: [],
      type: "@firebase/firestore",
    });

    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "[error-capture:firebase-sdk]",
      expect.objectContaining({
        message: "Could not reach Cloud Firestore backend.",
        context: { level: "error", type: "@firebase/firestore" },
      })
    );
  });

  it("mutes SDK console output and subscribes to warn and above", () => {
    installFirebaseLogCapture();

    expect(setLogLevel).toHaveBeenCalledWith("silent");
    expect(onLog).toHaveBeenCalledWith(handleFirebaseLog, { level: "warn" });
  });
});
