import { captureError } from "./capture";

// Benign browser notification, not an application failure.
const IGNORED_MESSAGE_PREFIXES = ["ResizeObserver loop"];

let uninstall: (() => void) | null = null;

function isIgnoredMessage(message: string): boolean {
  return IGNORED_MESSAGE_PREFIXES.some((prefix) => message.startsWith(prefix));
}

/**
 * Captures errors that escape React: uncaught exceptions and unhandled promise
 * rejections. Idempotent; returns a function that removes the listeners.
 */
export function installGlobalErrorCapture(target: Window = window): () => void {
  if (uninstall) {
    return uninstall;
  }

  const onError = (event: ErrorEvent) => {
    if (isIgnoredMessage(event.message)) {
      return;
    }
    captureError(event.error ?? event.message, {
      source: "window-error",
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    captureError(event.reason, { source: "unhandled-rejection" });
  };

  target.addEventListener("error", onError);
  target.addEventListener("unhandledrejection", onUnhandledRejection);

  uninstall = () => {
    target.removeEventListener("error", onError);
    target.removeEventListener("unhandledrejection", onUnhandledRejection);
    uninstall = null;
  };
  return uninstall;
}
