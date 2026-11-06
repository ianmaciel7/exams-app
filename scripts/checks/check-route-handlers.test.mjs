import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkRouteHandlers,
  inspectRouteHandler,
  isRouteHandler,
} from "./check-route-handlers.mjs";

const messages = (code) => inspectRouteHandler(code).map((p) => p.message);

describe("Route Handler contract guard", () => {
  it("accepts HTTP methods, segment config and imports", () => {
    assert.deepEqual(
      messages(`import "server-only";
import { ok } from "@/lib/server";
export const dynamic = "force-dynamic";
export const revalidate = 60;
export async function GET() { return ok({}); }
export const POST = async () => ok({});
export { DELETE } from "@/lib/handlers";`),
      [],
    );
  });

  it("rejects helpers declared in the file", () => {
    assert.match(
      messages(`function helper() {}\nexport async function GET() {}`)[0],
      /Helper "helper".*src\/lib/,
    );
    assert.match(messages("const LIMIT = 5;")[0], /Helper "LIMIT"/);
    assert.match(messages("type Body = {};")[0], /Helper "Body"/);
  });

  it("rejects exports that are not handlers or segment config", () => {
    assert.match(messages("export function helper() {}")[0], /"helper"/);
    assert.match(messages("export const config = {};")[0], /"config"/);
    assert.match(messages("export type Body = {};")[0], /"Body"/);
    assert.match(messages("export { a as helper } from './a';")[0], /"helper"/);
  });

  it("rejects default and star exports", () => {
    assert.match(messages("export default function () {}")[0], /default/);
    assert.match(messages("export default {};")[0], /default/);
    assert.match(messages("export * from './a';")[0], /export \*/);
  });

  it("recognises route handler files by name", () => {
    assert.equal(isRouteHandler("src/app/api/auth/session/route.ts"), true);
    assert.equal(isRouteHandler("src/app/route.ts"), true);
    assert.equal(
      isRouteHandler("src/app/api/auth/session/route.test.ts"),
      false,
    );
    assert.equal(isRouteHandler("src/app/page.tsx"), false);
  });

  it("passes for the repository", () => {
    assert.deepEqual(checkRouteHandlers(process.cwd()), []);
  });
});
