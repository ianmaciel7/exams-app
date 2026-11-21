import { afterEach, expect, it, vi } from "vitest";
import { onRequestError } from "./instrumentation";

const context = {
  routerKind: "App Router" as const,
  routePath: "/profile/[id]",
  routeType: "render" as const,
  revalidateReason: undefined,
};

const request = {
  path: "/profile/private-user?token=secret",
  method: "GET",
  headers: { authorization: "Bearer secret", cookie: "session=private" },
};

afterEach(() => vi.restoreAllMocks());

it("emits structured server errors without sensitive request or error data", async () => {
  const output = vi.spyOn(console, "error").mockImplementation(() => {});
  const error = Object.assign(new Error("password=private"), {
    digest: "12345",
  });
  await onRequestError(error, request, context);
  expect(output).toHaveBeenCalledOnce();
  expect(JSON.parse(output.mock.calls[0][0])).toEqual({
    severity: "ERROR",
    message: "Next.js request failed",
    event: "next_request_error",
    schemaVersion: 1,
    route: "/profile/[id]",
    routeType: "render",
    routerKind: "App Router",
    digest: "12345",
  });
});

it("handles non-Error throws and omits arbitrary error digest content", async () => {
  const output = vi.spyOn(console, "error").mockImplementation(() => {});
  for (const error of [null, "private", { digest: "private\nvalue" }]) {
    await onRequestError(error, request, context);
    expect(JSON.parse(output.mock.calls.at(-1)?.[0])).not.toHaveProperty(
      "digest",
    );
  }
});
