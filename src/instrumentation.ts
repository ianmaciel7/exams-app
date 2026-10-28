import type { Instrumentation } from "next";

/** Native Next.js server error boundary; Cloud Run collects structured stderr. */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  _request,
  context,
) => {
  // Use framework route templates rather than URLs containing IDs or queries.
  // Raw errors, stacks, and headers may contain secrets and are not serialized.
  const digest =
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    /^\d{1,20}$/.test(error.digest)
      ? error.digest
      : undefined;

  console.error(
    JSON.stringify({
      severity: "ERROR",
      message: "Next.js request failed",
      event: "next_request_error",
      schemaVersion: 1,
      route: context.routePath,
      routeType: context.routeType,
      routerKind: context.routerKind,
      ...(digest ? { digest } : {}),
    }),
  );
};
