import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkComponentsDirectory,
  inspectComponentsDirectory,
} from "./check-components-directory.mjs";

describe("src/components directory guard", () => {
  it("accepts ui, ui/extensions and ai-elements components", () => {
    assert.deepEqual(
      inspectComponentsDirectory({
        "src/components/ui/button.tsx": '"use client";\nexport {};',
        "src/components/ui/extensions/form.tsx": "export {};",
        "src/components/ai-elements/message.tsx": "export {};",
        "src/app/_components/session-provider-client.tsx": "export {};",
      }),
      [],
    );
  });

  it("rejects any folder that is not a registry, whatever its name", () => {
    const errors = inspectComponentsDirectory({
      "src/components/firebase/policies.tsx": "export {};",
      "src/components/auth/sign-in.tsx": "export {};",
      "src/components/loose.tsx": "export {};",
    });
    assert.equal(errors.length, 3);
    assert.match(errors[0], /_components/);
  });

  it("rejects -client and -server components inside a registry", () => {
    const errors = inspectComponentsDirectory({
      "src/components/ui/extensions/theme-provider-server.tsx": "export {};",
      "src/components/ui/extensions/theme-provider-server.test.tsx": "",
      "src/components/ai-elements/feed-server.ts": "",
    });
    assert.equal(errors.length, 3);
  });

  it("rejects server boundaries inside a registry", () => {
    const errors = inspectComponentsDirectory({
      "src/components/ui/x.tsx": 'import "server-only";\nexport {};',
      "src/components/ui/y.ts": '"use server";',
    });
    assert.equal(errors.length, 2);
  });

  it("passes on the repository", () => {
    assert.deepEqual(checkComponentsDirectory(process.cwd()), []);
  });
});
