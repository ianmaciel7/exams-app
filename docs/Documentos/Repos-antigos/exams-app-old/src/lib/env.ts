export interface Env {
  readonly NODE_ENV: "development" | "production" | "test";
  readonly OTEL_SERVICE_NAME: string | undefined;
  readonly NEXT_PUBLIC_GA_ID: string | undefined;
}

export const env: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) ?? "development",
  OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
};
