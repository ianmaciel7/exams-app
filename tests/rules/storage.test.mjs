import { after, before, describe, it } from "node:test";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { createRulesEnvironment } from "./helpers.mjs";

let env;

before(async () => {
  env = await createRulesEnvironment("demo-rules-storage", "storage");
});
after(() => env.cleanup());

const alice = () => env.authenticatedContext("alice").storage();
const bob = () => env.authenticatedContext("bob").storage();
const anonymous = () => env.unauthenticatedContext().storage();
const png = { contentType: "image/png" };

describe("storage.rules: users/{uid}/avatar", () => {
  it("lets an owner upload, read and delete a small image", async () => {
    const avatar = alice().ref("users/alice/avatar");
    await assertSucceeds(avatar.put(new Uint8Array(1024), png));
    await assertSucceeds(avatar.getMetadata());
    await assertSucceeds(avatar.delete());
  });

  it("refuses other users and anonymous visitors", async () => {
    await assertSucceeds(
      alice().ref("users/alice/avatar").put(new Uint8Array(8), png),
    );
    await assertFails(bob().ref("users/alice/avatar").getMetadata());
    await assertFails(anonymous().ref("users/alice/avatar").getMetadata());
    await assertFails(
      bob().ref("users/alice/avatar").put(new Uint8Array(8), png),
    );
    await assertFails(
      anonymous().ref("users/alice/avatar").put(new Uint8Array(8), png),
    );
    await assertFails(bob().ref("users/alice/avatar").delete());
  });

  it("refuses files over 2 MiB and non-image types", async () => {
    const avatar = alice().ref("users/alice/avatar");
    await assertFails(avatar.put(new Uint8Array(2 * 1024 * 1024 + 1), png));
    await assertFails(
      avatar.put(new Uint8Array(8), { contentType: "text/html" }),
    );
    await assertFails(
      avatar.put(new Uint8Array(8), { contentType: "image/svg+xml" }),
    );
  });

  it("denies every other path", async () => {
    await assertFails(
      alice().ref("users/alice/other").put(new Uint8Array(8), png),
    );
    await assertFails(alice().ref("public/file").put(new Uint8Array(8), png));
  });
});
