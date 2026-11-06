import type { NextResponse } from "next/server";
import { expect, expectTypeOf, it } from "vitest";
import * as server from "./server";

const body = new Uint8Array([10, 20, 30, 40]);
const headers = {
  ETag: '"v1,part"',
  "Last-Modified": "Thu, 05 Nov 2026 12:00:00 GMT",
  Vary: "Accept-Encoding",
  "Content-Location": "/file",
  "Cache-Control": "private, max-age=60",
};
const representation = { body, headers };
const request = (fields: HeadersInit = {}, method = "GET") =>
  new Request("https://example.com/file", { method, headers: fields });

it("retains typed JSON, named status and cookies", async () => {
  const response = server.ok({ id: 1 });
  expectTypeOf(response).toEqualTypeOf<NextResponse<{ id: number }>>();
  expect(await response.json()).toEqual({ id: 1 });
  response.cookies.set("session", "value", { httpOnly: true, secure: true });
  expect(response.headers.get("Set-Cookie")).toContain("HttpOnly");
  const options = { status: 500, headers: { "X-Test": "value" } };
  expect(server.ok({}, options).status).toBe(200);
});

it("uses a safe explicit cache policy and validates dates", () => {
  expect(server.ok({}).headers.get("Cache-Control")).toBeNull();
  expect(
    server
      .ok({}, { cache: { visibility: "private", maxAge: 60 } })
      .headers.get("Cache-Control"),
  ).toBe("private, max-age=60");
  expect(() => server.ok({}, { headers: { Date: "Invalid Date" } })).toThrow();
  expect(() =>
    server.ok({}, { cache: { visibility: "public", maxAge: -1 } }),
  ).toThrow();
  expect(
    server
      .preconditionRequired({}, { cache: { visibility: "public", maxAge: 60 } })
      .headers.get("Cache-Control"),
  ).toBe("no-store");
});

it("requires explicit creation identity and accepts URI references", () => {
  expect(
    server.created({ id: 1 }, { location: "/users/1" }).headers.get("Location"),
  ).toBe("/users/1");
  expect(
    server.created({}, { atRequestUri: "https://example.com/users/1" }).status,
  ).toBe(201);
  expect(() => server.created({}, undefined as never)).toThrow();
  expect(() =>
    server.created({}, { location: "javascript:alert(1)" }),
  ).toThrow();
  expect(() =>
    server.created({}, {
      location: "/a",
      atRequestUri: "https://example.com/b",
    } as never),
  ).toThrow();
});

it("builds valid authentication challenges instead of accepting unchecked strings", () => {
  expect(
    server
      .unauthorized(
        {},
        { challenge: { scheme: "Bearer", parameters: { realm: 'api"test' } } },
      )
      .headers.get("WWW-Authenticate"),
  ).toBe('Bearer realm="api\\"test"');
  expect(
    server.unauthorized(
      {},
      { challenge: { scheme: "Negotiate", token68: "YWJj==" } },
    ).status,
  ).toBe(401);
  expect(() =>
    server.unauthorized(
      {},
      { challenge: { scheme: "Bearer", token68: "???" } },
    ),
  ).toThrow();
  expect(() =>
    server.unauthorized({}, { challenge: { scheme: "Bearer ???" } }),
  ).toThrow();
  expect(() =>
    server.unauthorized(
      {},
      {
        challenge: { scheme: "Basic", parameters: { realm: "a", Realm: "b" } },
      },
    ),
  ).toThrow();
  expect(() =>
    server.unauthorized(
      {},
      { challenge: { scheme: "Bearer", parameters: { realm: "a\nb" } } },
    ),
  ).toThrow();
});

it("checks complete JSON media types and quoted parameters", () => {
  expect(
    server.ok(
      {},
      {
        headers: { "Content-Type": 'application/problem+json; profile="a;b"' },
      },
    ).status,
  ).toBe(200);
  expect(
    server.ok(
      {},
      { headers: { "Content-Type": "application/json; charset=utf-8" } },
    ).status,
  ).toBe(200);
  expect(() =>
    server.ok({}, { headers: { "Content-Type": "application/json; garbage" } }),
  ).toThrow();
  expect(() =>
    server.ok(
      {},
      {
        headers: { "Content-Type": 'application/json; profile="unterminated' },
      },
    ),
  ).toThrow();
  expect(() =>
    server.ok({}, { headers: { "Content-Type": "text/html" } }),
  ).toThrow();
});

it.each(["", "-1", "1.5", "Invalid Date"])(
  "rejects Retry-After %j across response kinds",
  (value) => {
    const options = { headers: { "Retry-After": value } };
    expect(() => server.tooManyRequests({}, options)).toThrow();
    expect(() =>
      server.temporaryRedirect("https://example.com", options),
    ).toThrow();
    expect(() => server.noContent(options)).toThrow();
    expect(() =>
      server.conditionalResponse(request(), { body, headers: options.headers }),
    ).toThrow();
  },
);

it("accepts delay seconds and HTTP dates without overriding the redirect", () => {
  expect(
    server.tooManyRequests({}, { retryAfter: 0 }).headers.get("Retry-After"),
  ).toBe("0");
  expect(
    server
      .serviceUnavailable({}, { retryAfter: new Date("2026-11-07T12:00:00Z") })
      .headers.get("Retry-After"),
  ).toBe("Sat, 07 Nov 2026 12:00:00 GMT");
  expect(
    server
      .temporaryRedirect("https://example.com", { retryAfter: 60 })
      .headers.get("Location"),
  ).toBe("https://example.com/");
});

it("requires methods and refuses caller-controlled framing", () => {
  expect(
    server
      .methodNotAllowed({}, { allow: ["GET", "HEAD"] })
      .headers.get("Allow"),
  ).toBe("GET, HEAD");
  expect(server.methodNotAllowed({}, { allow: [] }).headers.get("Allow")).toBe(
    "",
  );
  expect(() =>
    server.methodNotAllowed({}, { allow: ["GET\r\nInjected: yes"] }),
  ).toThrow();
  expect(() =>
    server.noContent({ headers: { "Content-Length": "0" } }),
  ).toThrow();
  expect(() =>
    server.ok({}, { headers: { "Content-Encoding": "gzip" } }),
  ).toThrow();
  expect(server.noContent().body).toBeNull();
  expect(server.resetContent().body).toBeNull();
});

it("provides contracts for asynchronous work and actionable errors", async () => {
  expect(
    server
      .accepted({ status: "queued" }, { monitor: "/jobs/1" })
      .headers.get("Location"),
  ).toBe("/jobs/1");
  expect(
    await server
      .conflict({ error: "Version changed", currentVersion: 2 })
      .json(),
  ).toMatchObject({ currentVersion: 2 });
  expect(
    server.notAcceptable({
      error: "Unsupported representation",
      available: ["application/json"],
    }).status,
  ).toBe(406);
  expect(
    server
      .contentTooLarge({ error: "Busy" }, { temporary: true, retryAfter: 60 })
      .headers.get("Retry-After"),
  ).toBe("60");
  expect(
    server
      .unavailableForLegalReasons(
        { error: "Access restricted" },
        { blockedBy: "https://example.com/operator" },
      )
      .headers.get("Link"),
  ).toContain('rel="blocked-by"');
});

it("does not expose functions that only throw for unimplemented protocols", () => {
  expect(server).not.toHaveProperty("multiStatus");
  expect(server).not.toHaveProperty("earlyHints");
  expect(server).not.toHaveProperty("imATeapot");
});

it.each([', "v1,part",', 'W/"v1,part", "other"', "*"])(
  "matches tolerant entity tag list %s",
  (condition) => {
    const response = server.conditionalResponse(
      request({ "If-None-Match": condition }),
      representation,
    );
    expect(response.status).toBe(304);
    expect(response.body).toBeNull();
    expect(response.headers.get("Vary")).toBe(headers.Vary);
    expect(response.headers.get("Content-Location")).toBe(
      headers["Content-Location"],
    );
  },
);

it("returns a full representation on a normal cache miss", async () => {
  expect(server.notModified(request(), headers)).toBeNull();
  expect(
    server.notModified(request({ "If-None-Match": '"other"' }), headers),
  ).toBeNull();
  const response = server.conditionalResponse(request(), representation);
  expect(response.status).toBe(200);
  expect(new Uint8Array(await response.arrayBuffer())).toEqual(body);
});

it("evaluates preconditions in precedence order with strong and weak comparisons", () => {
  const state = {
    exists: true,
    etag: '"v1,part"',
    lastModified: headers["Last-Modified"],
  };
  expect(
    server.evaluatePreconditions(
      request({ "If-Match": '"other"', "If-None-Match": '"v1,part"' }),
      state,
    ),
  ).toBe(412);
  expect(
    server.evaluatePreconditions(request({ "If-Match": 'W/"v1,part"' }), state),
  ).toBe(412);
  expect(
    server.evaluatePreconditions(
      request({
        "If-Match": '"v1,part"',
        "If-Unmodified-Since": "Wed, 04 Nov 2026 12:00:00 GMT",
      }),
      state,
    ),
  ).toBe(200);
  expect(
    server.evaluatePreconditions(
      request({ "If-Unmodified-Since": "Wed, 04 Nov 2026 12:00:00 GMT" }),
      state,
    ),
  ).toBe(412);
});

it("handles wildcard preconditions before mutations", () => {
  const state = { exists: true, etag: '"v1,part"' };
  expect(
    server.evaluatePreconditions(
      request({ "If-None-Match": "*" }, "PUT"),
      state,
    ),
  ).toBe(412);
  expect(
    server.evaluatePreconditions(request({ "If-None-Match": "*" }, "PUT"), {
      exists: false,
    }),
  ).toBe(200);
  expect(
    server.evaluatePreconditions(request({ "If-Match": "*" }, "PUT"), {
      exists: false,
    }),
  ).toBe(412);
});

it("honors modification dates and If-None-Match precedence", () => {
  expect(
    server.conditionalResponse(
      request({ "If-Modified-Since": headers["Last-Modified"] }),
      representation,
    ).status,
  ).toBe(304);
  expect(
    server.conditionalResponse(
      request({ "If-Modified-Since": "0" }),
      representation,
    ).status,
  ).toBe(200);
  expect(
    server.conditionalResponse(
      request({
        "If-Modified-Since": headers["Last-Modified"],
        "If-None-Match": '"other"',
      }),
      representation,
    ).status,
  ).toBe(200);
});

it("responds to malformed conditions and limits parser input", () => {
  expect(
    server.conditionalResponse(
      request({ "If-None-Match": '"a" "b"' }),
      representation,
    ).status,
  ).toBe(400);
  expect(
    server.conditionalResponse(
      request({ "If-None-Match": "a".repeat(17000) }),
      representation,
    ).status,
  ).toBe(431);
});

it.each([
  ["bytes=1-2", 206, "bytes 1-2/4", [20, 30]],
  ["bytes=2-999", 206, "bytes 2-3/4", [30, 40]],
  ["bytes=-2", 206, "bytes 2-3/4", [30, 40]],
  ["bytes=1-", 206, "bytes 1-3/4", [20, 30, 40]],
  ["bytes=9-10", 416, "bytes */4", []],
  ["bytes=2-1", 200, null, [10, 20, 30, 40]],
  ["bytes=0-0,2-2", 200, null, [10, 20, 30, 40]],
] as const)(
  "handles range %s",
  async (range, status, contentRange, expected) => {
    const response = server.conditionalResponse(
      request({ Range: range }),
      representation,
    );
    expect(response.status).toBe(status);
    expect(response.headers.get("Content-Range")).toBe(contentRange);
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual(
      expected,
    );
    expect(response.headers.get("Vary")).toBe(headers.Vary);
  },
);

it("evaluates cache conditions before ranges and honors If-Range", () => {
  expect(
    server.conditionalResponse(
      request({ Range: "bytes=1-2", "If-None-Match": '"v1,part"' }),
      representation,
    ).status,
  ).toBe(304);
  expect(
    server.conditionalResponse(
      request({ Range: "bytes=1-2", "If-Range": '"other"' }),
      representation,
    ).status,
  ).toBe(200);
  expect(
    server.conditionalResponse(
      request({ Range: "bytes=1-2", "If-Range": 'W/"v1,part"' }),
      representation,
    ).status,
  ).toBe(200);
  expect(
    server.conditionalResponse(
      request({ Range: "bytes=1-2", "If-Range": '"v1,part"' }),
      representation,
    ).status,
  ).toBe(206);
  expect(
    server.conditionalResponse(
      request({ Range: "bytes=1-2", "If-Range": headers["Last-Modified"] }),
      { ...representation, lastModifiedIsStrong: true },
    ).status,
  ).toBe(206);
});

it("suppresses HEAD bodies and handles methods and empty representations", () => {
  const response = server.conditionalResponse(
    request({ Range: "bytes=0-1" }, "HEAD"),
    representation,
  );
  expect(response.status).toBe(200);
  expect(response.body).toBeNull();
  expect(
    server
      .conditionalResponse(request({}, "POST"), representation)
      .headers.get("Allow"),
  ).toBe("GET, HEAD");
  expect(
    server.conditionalResponse(request({ Range: "bytes=0-" }), {
      ...representation,
      body: new Uint8Array(),
    }).status,
  ).toBe(416);
});
