import "server-only";
import { z } from "zod";
import { kinds, type RecallObject, type StudyRecord } from "@/domain/recall";
import { firebase } from "@/lib/firebase/admin";

export class RpcError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

export type McpContext = { spaceId: string; uid: string };

// spaceId is optional because an MCP client is handed a key, not a Space id —
// the key's binding is what scopes the query. A client that does pass one has
// it checked: a mismatch is Forbidden, never silently rescoped (spec.md 7.2.2).
const inSpace = z.object({ spaceId: z.string().optional() });

async function visibleObjects(spaceId: string) {
  const result = await firebase()
    .db.collection("objects")
    .where("spaceId", "==", spaceId)
    .get();
  return result.docs
    .map((doc) => ({ ...doc.data(), id: doc.id }) as RecallObject)
    .filter((object) => !object.archived && !object.reported)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function summarize(object: RecallObject) {
  return {
    id: object.id,
    title: object.title,
    type: object.kind,
    updatedAt: new Date(object.updatedAt).toISOString(),
  };
}

async function edges(field: "sourceId" | "targetId", objectId: string) {
  const result = await firebase()
    .db.collection("object_links")
    .where(field, "==", objectId)
    .get();
  return result.docs.map((doc) => {
    const data = doc.data();
    return {
      sourceId: data.sourceId as string,
      targetId: data.targetId as string,
      relationType: data.relationType as string,
    };
  });
}

const listObjects = {
  description:
    "List active objects in the Space, newest first. Paginate with cursor.",
  schema: inSpace.extend({
    type: z.enum(kinds).optional(),
    limit: z.number().int().min(1).max(100).default(50),
    cursor: z.string().optional(),
  }),
  inputSchema: {
    type: "object",
    properties: {
      spaceId: { type: "string" },
      type: { type: "string", enum: [...kinds] },
      limit: { type: "number", minimum: 1, maximum: 100 },
      cursor: { type: "string" },
    },
    required: [],
  },
  async run(
    context: McpContext,
    args: { type?: string; limit: number; cursor?: string },
  ) {
    const all = (await visibleObjects(context.spaceId)).filter(
      (object) => !args.type || object.kind === args.type,
    );
    const start = args.cursor
      ? all.findIndex((object) => object.id === args.cursor) + 1
      : 0;
    if (args.cursor && start === 0)
      throw new RpcError(-32602, "Unknown cursor.");
    const page = all.slice(start, start + args.limit);
    const next = all[start + args.limit] ? page[page.length - 1].id : null;
    return { objects: page.map(summarize), nextCursor: next };
  },
};

const getObject = {
  description:
    "Fetch one object's full content, outbound links, and backlinks.",
  schema: inSpace.extend({ objectId: z.string() }),
  inputSchema: {
    type: "object",
    properties: { spaceId: { type: "string" }, objectId: { type: "string" } },
    required: ["objectId"],
  },
  async run(context: McpContext, args: { objectId: string }) {
    const doc = await firebase()
      .db.collection("objects")
      .doc(args.objectId)
      .get();
    const data = doc.data() as (RecallObject & { body?: unknown }) | undefined;
    // A foreign Space's object is reported as missing, never as forbidden, so
    // the endpoint cannot be used to probe which ids exist elsewhere.
    if (!data || data.spaceId !== context.spaceId || data.archived)
      throw new RpcError(-32004, "Object not found in this Space.");
    const [links, backlinks] = await Promise.all([
      edges("sourceId", doc.id),
      edges("targetId", doc.id),
    ]);
    return {
      object: {
        ...summarize({ ...data, id: doc.id }),
        text: data.text,
        url: data.url,
        format: data.format,
        options: data.options,
        answers: data.answers,
        content: data.body ?? null,
      },
      links,
      backlinks,
    };
  },
};

const searchSpaceContent = {
  description: "Lexical search across object titles and text in the Space.",
  schema: inSpace.extend({
    query: z.string().trim().min(1).max(200),
    type: z.enum(kinds).optional(),
    limit: z.number().int().min(1).max(50).default(20),
  }),
  inputSchema: {
    type: "object",
    properties: {
      spaceId: { type: "string" },
      query: { type: "string" },
      type: { type: "string", enum: [...kinds] },
      limit: { type: "number", minimum: 1, maximum: 50 },
    },
    required: ["query"],
  },
  async run(
    context: McpContext,
    args: { query: string; type?: string; limit: number },
  ) {
    const needle = args.query.toLocaleLowerCase("en-US");
    const matches = (await visibleObjects(context.spaceId))
      .filter((object) => !args.type || object.kind === args.type)
      .map((object) => {
        const haystack = `${object.title}\n${object.text}`;
        return {
          object,
          at: haystack.toLocaleLowerCase("en-US").indexOf(needle),
        };
      })
      .filter((hit) => hit.at >= 0)
      .slice(0, args.limit)
      .map((hit) => ({
        id: hit.object.id,
        title: hit.object.title,
        type: hit.object.kind,
        snippet: `${hit.object.title}\n${hit.object.text}`
          .slice(Math.max(0, hit.at - 60), hit.at + 140)
          .trim(),
      }));
    return { matches };
  },
};

const getStudySummary = {
  description:
    "Spaced-repetition totals for the key creator's study records in the Space.",
  schema: inSpace,
  inputSchema: {
    type: "object",
    properties: { spaceId: { type: "string" } },
    required: [],
  },
  async run(context: McpContext) {
    const [objects, stored] = await Promise.all([
      visibleObjects(context.spaceId),
      firebase()
        .db.collection("spaces")
        .doc(context.spaceId)
        .collection("study")
        .doc(context.uid)
        .collection("records")
        .get(),
    ]);
    const questions = objects.filter((object) => object.kind === "question");
    const records = new Map(
      stored.docs.map((doc) => [doc.id, doc.data() as StudyRecord]),
    );
    const now = Date.now();
    const totals = { new: 0, learning: 0, young: 0, mature: 0 };
    let attempts = 0;
    let correct = 0;
    for (const question of questions) {
      const record = records.get(question.id);
      if (!record) {
        totals.new++;
        continue;
      }
      attempts += record.attempts;
      correct += record.correct;
      if (record.repetitions < 2) totals.learning++;
      else if (record.interval < 21) totals.young++;
      else totals.mature++;
    }
    return {
      totalQuestions: questions.length,
      dueCount: questions.filter((question) => {
        const record = records.get(question.id);
        return !record || record.due <= now;
      }).length,
      retentionRate: attempts ? correct / attempts : 0,
      masteryBreakdown: totals,
    };
  },
};

export const tools = {
  list_objects: listObjects,
  get_object: getObject,
  search_space_content: searchSpaceContent,
  get_study_summary: getStudySummary,
};

export function describeTools() {
  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));
}

export async function callTool(
  context: McpContext,
  name: string,
  rawArgs: unknown,
) {
  const tool = tools[name as keyof typeof tools];
  if (!tool) throw new RpcError(-32601, `Unknown tool: ${name}`);
  const parsed = tool.schema.safeParse(rawArgs ?? {});
  if (!parsed.success)
    throw new RpcError(-32602, parsed.error.issues[0]?.message ?? "Bad params");
  if (parsed.data.spaceId && parsed.data.spaceId !== context.spaceId)
    throw new RpcError(-32003, "This key is not bound to that Space.");
  // biome-ignore lint/suspicious/noExplicitAny: each tool narrows its own args via its zod schema.
  return tool.run(context, parsed.data as any);
}
