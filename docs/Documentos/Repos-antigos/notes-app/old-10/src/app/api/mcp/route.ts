import type { ApiKey } from "@/domain/api-keys";
import { bearerToken, hashApiKey } from "@/domain/api-keys";
import { firebase } from "@/lib/firebase/admin";
import {
  callTool,
  describeTools,
  type McpContext,
  RpcError,
} from "@/lib/mcp/tools";

const protocolVersion = "2025-06-18";
type Id = string | number | null;

function envelope(id: Id, body: Record<string, unknown>) {
  return { jsonrpc: "2.0", id, ...body };
}

function reply(payload: unknown, status: number, sse: boolean) {
  const json = JSON.stringify(payload);
  return sse
    ? new Response(`event: message\ndata: ${json}\n\n`, {
        status,
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
          connection: "keep-alive",
        },
      })
    : new Response(json, {
        status,
        headers: { "content-type": "application/json" },
      });
}

async function resolveKey(request: Request): Promise<McpContext> {
  const raw = bearerToken(request.headers.get("authorization"));
  if (!raw) throw new RpcError(-32001, "Missing or malformed API key.");
  const { db } = firebase();
  const found = await db
    .collection("api_keys")
    .where("keyHash", "==", hashApiKey(raw))
    .limit(1)
    .get();
  const doc = found.docs[0];
  const key = doc?.data() as ApiKey | undefined;
  if (!key || key.revokedAt)
    throw new RpcError(-32001, "Invalid or revoked API key.");
  const space = await db.collection("spaces").doc(key.spaceId).get();
  if (!space.data()?.members?.includes(key.createdBy))
    throw new RpcError(-32003, "Key creator no longer has Space access.");
  await doc.ref.update({ lastUsedAt: new Date().toISOString() });
  return { spaceId: key.spaceId, uid: key.createdBy };
}

async function dispatch(context: McpContext, method: string, params: unknown) {
  if (method === "initialize")
    return {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "recall", version: "1.0.0" },
    };
  if (method === "ping" || method.startsWith("notifications/")) return {};
  if (method === "tools/list") return { tools: describeTools() };
  if (method === "tools/call") {
    const call = params as { name?: unknown; arguments?: unknown };
    if (typeof call?.name !== "string")
      throw new RpcError(-32602, "A tool name is required.");
    const result = await callTool(context, call.name, call.arguments);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  }
  throw new RpcError(-32601, `Unknown method: ${method}`);
}

export async function POST(request: Request) {
  const sse = (request.headers.get("accept") ?? "").includes(
    "text/event-stream",
  );
  let message: {
    jsonrpc?: unknown;
    id?: Id;
    method?: unknown;
    params?: unknown;
  };
  try {
    message = await request.json();
  } catch {
    return reply(
      envelope(null, { error: { code: -32700, message: "Invalid JSON." } }),
      400,
      sse,
    );
  }
  const id = message?.id ?? null;
  if (message?.jsonrpc !== "2.0" || typeof message?.method !== "string")
    return reply(
      envelope(id, {
        error: { code: -32600, message: "Invalid JSON-RPC request." },
      }),
      400,
      sse,
    );
  try {
    const context = await resolveKey(request);
    // A notification carries no id and, per JSON-RPC, must not be answered.
    if (message.id === undefined) {
      await dispatch(context, message.method, message.params);
      return new Response(null, { status: 202 });
    }
    return reply(
      envelope(id, {
        result: await dispatch(context, message.method, message.params),
      }),
      200,
      sse,
    );
  } catch (cause) {
    const code = cause instanceof RpcError ? cause.code : -32603;
    const status = code === -32001 ? 401 : code === -32003 ? 403 : 200;
    return reply(
      envelope(id, {
        error: {
          code,
          message:
            cause instanceof RpcError
              ? cause.message
              : "The server could not complete that request.",
        },
      }),
      status,
      sse,
    );
  }
}
