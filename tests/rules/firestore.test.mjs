import { after, before, beforeEach, describe, it } from "node:test";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { createRulesEnvironment } from "./helpers.mjs";

let env;

before(async () => {
  env = await createRulesEnvironment("demo-rules-firestore", "firestore");
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const alice = () => env.authenticatedContext("alice").firestore();
const bob = () => env.authenticatedContext("bob").firestore();
const admin = () =>
  env.authenticatedContext("root", { role: "admin" }).firestore();
const anonymous = () => env.unauthenticatedContext().firestore();
const fakeAdmin = () =>
  env.authenticatedContext("mallory", { role: "user" }).firestore();

async function seedProfile(data = { locale: "en", theme: "dark" }) {
  await env.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc("users/alice").set(data);
  });
}

describe("firestore.rules: users/{uid}", () => {
  it("lets an owner create a valid profile", async () => {
    await assertSucceeds(
      alice().doc("users/alice").set({ locale: "pt-BR", theme: "system" }),
    );
  });

  it("refuses an anonymous or cross-user create", async () => {
    await assertFails(anonymous().doc("users/alice").set({ locale: "en" }));
    await assertFails(bob().doc("users/alice").set({ locale: "en" }));
  });

  it("refuses unknown fields, so a client cannot write a role", async () => {
    await assertFails(
      alice().doc("users/alice").set({ locale: "en", role: "admin" }),
    );
  });

  it("refuses unsupported locale and theme values", async () => {
    await assertFails(alice().doc("users/alice").set({ locale: "fr" }));
    await assertFails(alice().doc("users/alice").set({ theme: "neon" }));
  });

  it("reads only as owner or administrator", async () => {
    await seedProfile();
    await assertSucceeds(alice().doc("users/alice").get());
    await assertSucceeds(admin().doc("users/alice").get());
    await assertFails(bob().doc("users/alice").get());
    await assertFails(anonymous().doc("users/alice").get());
    await assertFails(fakeAdmin().doc("users/alice").get());
  });

  it("lets an owner update only locale and theme", async () => {
    await seedProfile();
    await assertSucceeds(alice().doc("users/alice").update({ theme: "light" }));
    await assertFails(alice().doc("users/alice").update({ role: "admin" }));
    await assertFails(alice().doc("users/alice").update({ theme: "neon" }));
    await assertFails(bob().doc("users/alice").update({ theme: "light" }));
    await assertFails(admin().doc("users/alice").update({ theme: "light" }));
  });

  it("lets only the owner delete a profile", async () => {
    await seedProfile();
    await assertFails(bob().doc("users/alice").delete());
    await assertFails(admin().doc("users/alice").delete());
    await assertSucceeds(alice().doc("users/alice").delete());
  });

  it("does not allow listing every profile", async () => {
    await seedProfile();
    await assertFails(alice().collection("users").get());
  });
});

describe("firestore.rules: usageLogs and unmatched paths", () => {
  it("keeps legacy usageLogs closed to every client, even administrators", async () => {
    await assertFails(admin().doc("usageLogs/one").get());
    await assertFails(admin().doc("usageLogs/one").set({ a: 1 }));
    await assertFails(alice().collection("usageLogs").get());
  });

  it("denies any collection without a rule", async () => {
    await assertFails(alice().doc("exams/one").get());
    await assertFails(admin().doc("exams/one").set({ a: 1 }));
  });
});
