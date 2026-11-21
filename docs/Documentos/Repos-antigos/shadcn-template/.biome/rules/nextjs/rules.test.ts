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

describe("prefer-page-props", () => {
  const message = "generated PageProps helper";

  it("reports a hand-written params type", () => {
    const output = lint(
      "page-invalid.tsx",
      "export default async function Page({ params }: { params: Promise<{ id: string }> }) {\n  return (await params).id;\n}\n",
    );
    expect(output).toContain(message);
  });

  it("accepts the generated PageProps type", () => {
    const output = lint(
      "page-valid.tsx",
      'export default async function Page(props: PageProps<"/a/[id]">) {\n  return (await props.params).id;\n}\n',
    );
    expect(output).not.toContain(message);
  });
});

describe("prefer-layout-props", () => {
  const message = "generated LayoutProps helper";

  it("reports children typed as ReactNode", () => {
    const output = lint(
      "layout-invalid.tsx",
      'import type { ReactNode } from "react";\nexport default function Layout({ children }: { children: ReactNode }) {\n  return children;\n}\n',
    );
    expect(output).toContain(message);
  });

  it("accepts the generated LayoutProps type", () => {
    const output = lint(
      "layout-valid.tsx",
      'export default function Layout({ children }: LayoutProps<"/">) {\n  return children;\n}\n',
    );
    expect(output).not.toContain(message);
  });
});

describe("prefer-route-context", () => {
  const message = "generated RouteContext helper";

  it("reports a hand-written params type", () => {
    const output = lint(
      "route-invalid.ts",
      "export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {\n  return Response.json(await params);\n}\n",
    );
    expect(output).toContain(message);
  });

  it("accepts the generated RouteContext type", () => {
    const output = lint(
      "route-valid.ts",
      'export async function GET(_request: Request, context: RouteContext<"/a/[id]">) {\n  return Response.json(await context.params);\n}\n',
    );
    expect(output).not.toContain(message);
  });
});
