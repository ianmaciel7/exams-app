import { registerOTel } from "@vercel/otel";
import type { Instrumentation } from "next";
import { env } from "@/lib/env";

export async function register() {
  registerOTel({
    serviceName: env.OTEL_SERVICE_NAME,
  });
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  console.error(
    JSON.stringify({
      severity: "ERROR",
      event: "next_request_error",
      message: err instanceof Error ? err.message : String(err),
      digest: (err as { digest?: string }).digest,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routeType: context.routeType,
    }),
  );
};
