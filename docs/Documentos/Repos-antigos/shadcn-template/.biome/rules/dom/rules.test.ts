import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");
const biome = join(root, "node_modules/@biomejs/biome/bin/biome");
// Biome 2.5 expects explicitly checked files to be under the workspace root.
// Keep fixtures inside the repository and remove them after the test suite.
const dir = mkdtempSync(join(root, ".biome", "grit-rules-"));

afterAll(() => rmSync(dir, { recursive: true, force: true }));

// Biome has no test harness for GritQL plugins, so lint a fixture with the
// project configuration and return everything the CLI printed.
function lint(name: string, source: string) {
  const file = join(dir, name);
  writeFileSync(file, source);
  const args = [
    biome,
    "lint",
    `--config-path=${join(root, "biome.json")}`,
    file,
  ];
  try {
    return execFileSync(process.execPath, args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const { stdout = "", stderr = "" } = error as {
      stdout?: string;
      stderr?: string;
    };
    return `${stdout}${stderr}`;
  }
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
