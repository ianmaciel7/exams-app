import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkNeutralComponents,
  findClientReason,
  inspectNeutralComponents,
} from "./check-neutral-components.mjs";

const directive = '"use client";\n';
const inspect = (code, file = "src/components/ui/x.tsx") =>
  inspectNeutralComponents({ [file]: code });

describe("neutral component guard", () => {
  it("rejects the directive on a module with no client need", () => {
    const errors = inspect(
      `${directive}export function X() { return <div className="a" />; }`,
    );
    assert.equal(errors.length, 1);
    assert.match(errors[0], /x\.tsx.*needs nothing from the browser/);
  });

  it("accepts a neutral module without the directive", () => {
    assert.deepEqual(inspect("export const X = () => <div />;"), []);
  });

  it("accepts the directive when the module calls a Hook", () => {
    assert.deepEqual(
      inspect(
        `${directive}export const X = () => { useState(0); return null; };`,
      ),
      [],
    );
    assert.equal(findClientReason("const t = React.useId();"), "calls useId");
  });

  it("accepts the directive for context, handlers and browser globals", () => {
    assert.deepEqual(inspect(`${directive}const C = createContext(1);`), []);
    assert.deepEqual(
      inspect(`${directive}export const X = () => <button onClick={f} />;`),
      [],
    );
    assert.deepEqual(
      inspect(`${directive}export const w = () => window.innerWidth;`),
      [],
    );
  });

  it("does not mistake a member named like a global for the global", () => {
    assert.equal(findClientReason("const a = props.window;"), null);
  });

  it("applies to every component folder and ignores tests", () => {
    const code = `${directive}export const X = () => <i />;`;
    assert.equal(inspect(code, "src/app/a/_components/x-client.tsx").length, 1);
    assert.deepEqual(inspect(code, "src/components/ui/x.test.tsx"), []);
  });

  it("passes on this repository", () => {
    assert.deepEqual(checkNeutralComponents(process.cwd()), []);
  });
});
