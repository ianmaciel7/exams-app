import type { Instrumentation } from "next";
import { captureError } from "@/lib/error-capture/capture";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context
) => {
  captureError(error, {
    source: "server-request",
    context: {
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
    },
  });
};
