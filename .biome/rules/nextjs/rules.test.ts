import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { createTempDirs, lintText, removeTempPaths } from "../test-helpers";

const [dir] = createTempDirs([".biome"], "grit-rules-nextjs-");

afterAll(() => removeTempPaths([dir]));

function lint(name: string, source: string) {
  const file = join(dir, name);
  writeFileSync(file, source);
  return lintText(file, ["--only=plugin"]);
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

  it("reports a route-named page component with a hand-written params type", () => {
    const output = lint(
      "profile-page-invalid.tsx",
      "export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {\n  return (await params).id;\n}\n",
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
