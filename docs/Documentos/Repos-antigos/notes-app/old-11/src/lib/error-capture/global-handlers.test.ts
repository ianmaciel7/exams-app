import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCapturedErrorsForTest } from "./capture";
import { installGlobalErrorCapture } from "./global-handlers";

function dispatchWindowError(init: ErrorEventInit) {
  window.dispatchEvent(new ErrorEvent("error", init));
}

function dispatchRejection(reason: unknown) {
  const event = new Event("unhandledrejection") as PromiseRejectionEvent;
  Object.defineProperty(event, "reason", { value: reason });
  window.dispatchEvent(event);
}

describe("installGlobalErrorCapture", () => {
  let uninstall: () => void;

  beforeEach(() => {
    resetCapturedErrorsForTest();
    vi.spyOn(console, "error").mockImplementation(() => {});
    uninstall = installGlobalErrorCapture();
  });

  afterEach(() => {
    uninstall();
    vi.restoreAllMocks();
  });

  it("captures uncaught window errors with location context", () => {
    dispatchWindowError({
      error: new Error("uncaught"),
      message: "uncaught",
      filename: "app.js",
      lineno: 3,
      colno: 9,
    });

    expect(console.error).toHaveBeenCalledWith(
      "[error-capture:window-error]",
      expect.objectContaining({
        message: "uncaught",
        context: { filename: "app.js", lineno: 3, colno: 9 },
      })
    );
  });

  it("falls back to the event message when no error object is provided", () => {
    dispatchWindowError({ message: "Script error." });

    expect(console.error).toHaveBeenCalledWith(
      "[error-capture:window-error]",
      expect.objectContaining({ message: "Script error." })
    );
  });

  it("ignores benign ResizeObserver loop notifications", () => {
    dispatchWindowError({
      message: "ResizeObserver loop completed with undelivered notifications.",
    });

    expect(console.error).not.toHaveBeenCalled();
  });

  it("captures unhandled promise rejections", () => {
    dispatchRejection(new Error("rejected"));

    expect(console.error).toHaveBeenCalledWith(
      "[error-capture:unhandled-rejection]",
      expect.objectContaining({ message: "rejected" })
    );
  });

  it("is idempotent and does not double-register listeners", () => {
    expect(installGlobalErrorCapture()).toBe(uninstall);

    dispatchRejection(new Error("once"));

    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("stops capturing after uninstall", () => {
    uninstall();

    dispatchRejection(new Error("after"));

    expect(console.error).not.toHaveBeenCalled();
    uninstall = installGlobalErrorCapture();
  });
});
