import { expect, test } from "@playwright/test";
import { createObject, createSpace, signUp } from "./helpers";

type RpcResult = {
  result?: { structuredContent?: Record<string, never> };
  error?: { code: number; message: string };
};

test("a key issued in settings drives the MCP server, and revoking it kills access", async ({
  page,
  request,
}) => {
  await signUp(page);
  await createSpace(page, "MCP space");
  const noteId = await createObject(page, {
    kind: "note",
    title: "Krebs cycle",
    text: "Also called the citric acid cycle.",
  });

  await page.goto("/settings");
  await page.locator("#key-label").fill("e2e client");
  await page.getByRole("button", { name: "Generate key" }).click();
  const key = await page.getByTestId("issued-key").innerText();
  expect(key).toMatch(/^rcl_live_[0-9A-Za-z]{32}$/);

  const call = (body: unknown, token = key) =>
    request.post("/api/mcp", {
      headers: { authorization: `Bearer ${token}` },
      data: body,
      failOnStatusCode: false,
    });
  const rpc = (name: string, args: Record<string, unknown> = {}) =>
    call({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    });

  const listed = (await (await rpc("list_objects")).json()) as RpcResult;
  expect(listed.result?.structuredContent).toMatchObject({
    objects: [{ id: noteId, title: "Krebs cycle", type: "note" }],
  });

  const found = (await (
    await rpc("search_space_content", { query: "citric acid" })
  ).json()) as RpcResult;
  expect(found.result?.structuredContent).toMatchObject({
    matches: [{ id: noteId }],
  });

  // The key is bound to one Space; naming a different one is Forbidden rather
  // than silently answered from the bound Space.
  const foreign = (await (
    await rpc("list_objects", { spaceId: "some-other-space" })
  ).json()) as RpcResult;
  expect(foreign.error?.code).toBe(-32003);

  const missing = (await (
    await rpc("get_object", { objectId: "does-not-exist" })
  ).json()) as RpcResult;
  expect(missing.error?.code).toBe(-32004);

  await page.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText("Revoked")).toBeVisible();

  const afterRevoke = await call({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
  });
  expect(afterRevoke.status()).toBe(401);
  expect(((await afterRevoke.json()) as RpcResult).error?.code).toBe(-32001);
});

test("the MCP server rejects an unknown key and malformed envelopes", async ({
  request,
}) => {
  const anonymous = await request.post("/api/mcp", {
    data: { jsonrpc: "2.0", id: 1, method: "tools/list" },
    failOnStatusCode: false,
  });
  expect(anonymous.status()).toBe(401);
  expect(((await anonymous.json()) as RpcResult).error?.code).toBe(-32001);

  const badEnvelope = await request.post("/api/mcp", {
    data: { id: 1, method: "tools/list" },
    failOnStatusCode: false,
  });
  expect(((await badEnvelope.json()) as RpcResult).error?.code).toBe(-32600);
});
