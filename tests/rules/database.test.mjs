import { after, before, describe, it } from "node:test";
import { assertFails } from "@firebase/rules-unit-testing";
import { createRulesEnvironment } from "./helpers.mjs";

let env;

before(async () => {
  env = await createRulesEnvironment("demo-rules-database", "database");
});
after(() => env.cleanup());

describe("database.rules.json: deny all", () => {
  it("refuses reads and writes for anonymous and signed-in clients", async () => {
    for (const context of [
      env.unauthenticatedContext(),
      env.authenticatedContext("alice"),
      env.authenticatedContext("root", { role: "admin" }),
    ]) {
      const database = context.database();
      await assertFails(database.ref("any/path").get());
      await assertFails(database.ref("any/path").set({ a: 1 }));
    }
  });
});
