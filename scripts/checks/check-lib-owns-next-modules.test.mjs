import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkLibOwnership,
  inspectLibOwnership,
} from "./check-lib-owns-next-modules.mjs";

const owner = (name) => ({
  [`src/lib/${name}.ts`]: `import { x } from "next/${name}";\nexport { x };`,
});

describe("lib owns Next.js modules guard", () => {
  it("accepts imports through the lib owner", () => {
    assert.deepEqual(
      inspectLibOwnership({
        ...owner("navigation"),
        "src/a.ts": 'import { x } from "@/lib/navigation";',
      }),
      [],
    );
  });

  it("rejects a direct import of an owned Next.js module", () => {
    const [message] = inspectLibOwnership({
      ...owner("navigation"),
      "src/dal.ts": 'import { notFound } from "next/navigation";',
    });
    assert.match(message, /src\/dal\.ts.*@\/lib\/navigation/);
  });

  it("covers re-exports, dynamic imports, require and nested lib folders", () => {
    const errors = inspectLibOwnership({
      ...owner("headers"),
      "src/a.ts": 'export { cookies } from "next/headers";',
      "src/b.ts": 'const m = await import("next/headers");',
      "src/c.cjs.ts": 'const m = require("next/headers");',
      "src/lib/firebase/server.ts": 'import { headers } from "next/headers";',
    });
    assert.equal(errors.length, 4);
  });

  it("owns any future module without a list", () => {
    assert.equal(
      inspectLibOwnership({
        ...owner("cache"),
        "src/a.ts": 'import { unstable_cache } from "next/cache";',
      }).length,
      1,
    );
  });

  it("leaves Next.js modules without a lib owner free", () => {
    assert.deepEqual(
      inspectLibOwnership({
        "src/a.tsx": 'import Link from "next/link";',
        "src/lib/utils.ts": "export const x = 1;",
      }),
      [],
    );
  });

  it("does not treat subpaths or tests as violations", () => {
    assert.deepEqual(
      inspectLibOwnership({
        ...owner("font"),
        "src/a.ts": 'import { Geist } from "next/font/google";',
        "src/a.test.ts": 'vi.mock("next/font", () => ({}));',
      }),
      [],
    );
  });

  it("passes on this repository", () => {
    assert.deepEqual(
      checkLibOwnership(new URL("../../", import.meta.url).pathname),
      [],
    );
  });
});
