export type ErrorSource =
  | "window-error"
  | "unhandled-rejection"
  | "error-boundary"
  | "global-error"
  | "server-request"
  | "firebase-sdk";

export interface CapturedError {
  name: string;
  message: string;
  stack?: string;
  digest?: string;
  source: ErrorSource;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface CaptureErrorOptions {
  source: ErrorSource;
  context?: Record<string, unknown>;
  /**
   * `console.error` opens the Next.js dev overlay; use "warn" for degraded but
   * recoverable conditions (e.g. the backend is unreachable).
   */
  severity?: "error" | "warn";
}

const DEDUPE_WINDOW_MS = 1000;

const recentlyReported = new Map<string, number>();

function readDigest(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "digest" in error) {
    return String((error as { digest: unknown }).digest);
  }
  return undefined;
}

export function normalizeError(
  error: unknown
): Pick<CapturedError, "name" | "message" | "stack" | "digest"> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      digest: readDigest(error),
    };
  }
  if (typeof error === "string") {
    return { name: "NonErrorThrown", message: error };
  }
  let message: string;
  try {
    message = JSON.stringify(error) ?? String(error);
  } catch {
    message = String(error);
  }
  return { name: "NonErrorThrown", message, digest: readDigest(error) };
}

// The same failure commonly surfaces through several channels (React error
// boundary, window "error" event, StrictMode effect double-invoke), so
// duplicates inside a short window are dropped regardless of source.
function isDuplicate(key: string, now: number): boolean {
  for (const [seenKey, seenAt] of recentlyReported) {
    if (now - seenAt > DEDUPE_WINDOW_MS) {
      recentlyReported.delete(seenKey);
    }
  }
  if (recentlyReported.has(key)) {
    return true;
  }
  recentlyReported.set(key, now);
  return false;
}

/**
 * Single funnel for every unexpected error in the app. Swap the `console.error`
 * call below for a real reporting service when one is adopted.
 */
export function captureError(
  error: unknown,
  { source, context, severity = "error" }: CaptureErrorOptions
): CapturedError | null {
  const normalized = normalizeError(error);
  const now = Date.now();
  const key = `${normalized.name}|${normalized.message}|${normalized.digest ?? ""}`;
  if (isDuplicate(key, now)) {
    return null;
  }

  const captured: CapturedError = {
    ...normalized,
    source,
    context,
    timestamp: new Date(now).toISOString(),
  };
  console[severity](`[error-capture:${source}]`, captured);
  return captured;
}

export function resetCapturedErrorsForTest(): void {
  recentlyReported.clear();
}
