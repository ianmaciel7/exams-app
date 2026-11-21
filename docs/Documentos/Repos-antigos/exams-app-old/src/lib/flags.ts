import { flag } from "flags/next";
import { env } from "./env";

export const enableAnalytics = flag<boolean>({
  key: "enable-analytics",
  defaultValue: false,
  description:
    "Enables Google Analytics tracking when NEXT_PUBLIC_GA_ID is set",
  async decide() {
    return Boolean(env.NEXT_PUBLIC_GA_ID);
  },
});

export const enableTelemetry = flag<boolean>({
  key: "enable-telemetry",
  defaultValue: false,
  description:
    "Enables OpenTelemetry runtime instrumentation when OTEL_SERVICE_NAME is set",
  async decide() {
    return Boolean(env.OTEL_SERVICE_NAME);
  },
});
