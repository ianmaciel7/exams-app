import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { createTempDirs, lintText, removeTempPaths } from "../test-helpers";

const [dir] = createTempDirs([".biome"], "grit-rules-dom-");

afterAll(() => removeTempPaths([dir]));

function lint(name: string, source: string) {
  const file = join(dir, name);
  writeFileSync(file, source);
  return lintText(file, ["--only=plugin"]);
}

describe("no-document-write", () => {
  const message =
    "Avoid using deprecated and unsafe DOM API 'document.write()'";

  describe("invalid cases", () => {
    it("reports document.write()", () => {
      const output = lint(
        "invalid-document-write.js",
        'document.write("<h1>bad</h1>");\n',
      );
      expect(output).toContain(message);
    });

    it("reports document.writeln()", () => {
      const output = lint(
        "invalid-document-writeln.js",
        'document.writeln("text");\n',
      );
      expect(output).toContain(message);
    });

    it("reports window.document.write()", () => {
      const output = lint(
        "invalid-window-document-write.js",
        'window.document.write("unsafe");\n',
      );
      expect(output).toContain(message);
    });

    it("reports window.document.writeln()", () => {
      const output = lint(
        "invalid-window-document-writeln.js",
        'window.document.writeln("unsafe");\n',
      );
      expect(output).toContain(message);
    });

    it("reports globalThis.document.write()", () => {
      const output = lint(
        "invalid-global-this-document-write.js",
        'globalThis.document.write("unsafe");\n',
      );
      expect(output).toContain(message);
    });

    it("reports globalThis.document.writeln()", () => {
      const output = lint(
        "invalid-global-this-document-writeln.js",
        'globalThis.document.writeln("unsafe");\n',
      );
      expect(output).toContain(message);
    });
  });

  describe("valid cases", () => {
    it("accepts document.createElement and appendChild", () => {
      const output = lint(
        "valid-create-element.js",
        'const el = document.createElement("div");\ndocument.body.appendChild(el);\n',
      );
      expect(output).not.toContain(message);
    });

    it("accepts modern DOM and React JSX code", () => {
      const output = lint(
        "valid-react.tsx",
        'export function SafeComponent() {\n  const greeting = "Hello world";\n  return <div>{greeting}</div>;\n}\n',
      );
      expect(output).not.toContain(message);
    });
  });
});
