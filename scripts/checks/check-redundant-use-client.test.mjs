import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkRedundantUseClient,
  inspectRedundantUseClient,
} from "./check-redundant-use-client.mjs";

const client = '"use client";\nexport {};';

describe("redundant use client guard", () => {
  it("accepts a neutral field imported by a client form", () => {
    assert.deepEqual(
      inspectRedundantUseClient({
        "src/app/x/page.tsx": 'import { F } from "./_components/f-client";',
        "src/app/x/_components/f-client.tsx": `${client}\nimport "./email-field";`,
        "src/app/x/_components/email-field.tsx": "export {};",
      }),
      [],
    );
  });

  it("rejects a directive on a module only client modules import", () => {
    const errors = inspectRedundantUseClient({
      "src/app/x/_components/f-client.tsx": `${client}\nimport "./email-field";`,
      "src/app/x/_components/email-field.tsx": client,
    });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /email-field\.tsx.*redundant/);
  });

  it("keeps the directive when a Server Component imports the module", () => {
    assert.deepEqual(
      inspectRedundantUseClient({
        "src/app/x/page.tsx": 'import "./_components/card";',
        "src/app/x/_components/f-client.tsx": `${client}\nimport "./card";`,
        "src/app/x/_components/card.tsx": client,
      }),
      [],
    );
  });

  it("keeps -client integrations, doc effect components and unused modules", () => {
    assert.deepEqual(
      inspectRedundantUseClient({
        "src/app/x/_components/f-client.tsx": `${client}\nimport "./g-client";\nimport "./navigation-events";`,
        "src/app/x/_components/g-client.tsx": client,
        "src/app/x/_components/navigation-events.tsx": client,
        "src/app/x/_components/lonely.tsx": client,
      }),
      [],
    );
  });

  it("passes on the repository", () => {
    assert.deepEqual(
      checkRedundantUseClient(new URL("../../", import.meta.url).pathname),
      [],
    );
  });
});
