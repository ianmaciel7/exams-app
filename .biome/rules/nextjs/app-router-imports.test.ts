import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  createTempDirs,
  diagnosticsForFile,
  lintJson,
  lintText,
  removeTempPaths,
  root,
  sweepStaleTempDirs,
} from "../test-helpers";

const targetParents = [
  "src/app",
  "src/components",
  "src/hooks",
  "src/components/ui/extensions",
] as const;

sweepStaleTempDirs(["src/components/ui"], "next-import-");
const directories = createTempDirs(targetParents, "next-import-rules-");
const vendorFile = join(
  root,
  "src/components/ui",
  `next-import-${process.pid}.tsx`,
);

afterAll(() => {
  removeTempPaths([...directories, vendorFile]);
});

const restrictedRuleFlag = ["--only=style/noRestrictedImports"] as const;

function lintSingle(file: string, source: string) {
  writeFileSync(file, source);
  return lintText(file, restrictedRuleFlag);
}

describe("native App Router import policy", () => {
  it.each(["next/router", "next/head", "next/document", "next/app"])(
    "rejects %s throughout owned application code",
    (path) => {
      const files = directories.map((directory) => {
        const file = join(directory, "invalid.tsx");
        writeFileSync(file, `import Legacy from "${path}"; export { Legacy };`);
        return file;
      });
      const result = lintJson(files, restrictedRuleFlag);
      for (const file of files) {
        const fileDiagnostics = diagnosticsForFile(result, file);
        expect(fileDiagnostics).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              category: "lint/style/noRestrictedImports",
            }),
          ]),
        );
      }
    },
  );

  it.each([
    "next/navigation",
    "next/link",
    "next/image",
    "next/headers",
    "next/cache",
  ])("accepts the App Router API %s", (path) => {
    const output = lintSingle(
      join(directories[0], "valid.tsx"),
      `import * as NextApi from "${path}"; export { NextApi };`,
    );
    expect(output).not.toContain("lint/style/noRestrictedImports");
    expect(output).not.toContain("parse");
  });

  it.each([
    'import { useRouter } from "@/i18n/navigation"; export { useRouter };',
    'export { Link } from "@/i18n/navigation";',
  ])("rejects the removed navigation shim: %s", (source) => {
    expect(lintSingle(join(directories[0], "shim.ts"), source)).toContain(
      "lint/style/noRestrictedImports",
    );
  });

  it.each([
    'import { useRouter } from "next/navigation"; export { useRouter };',
    'export { useRouter } from "next/navigation";',
  ])("rejects direct useRouter outside useNavigation: %s", (source) => {
    const files = directories.map((directory) => {
      const file = join(directory, "router.ts");
      writeFileSync(file, source);
      return file;
    });
    const result = lintJson(files, restrictedRuleFlag);
    for (const file of files) {
      expect(diagnosticsForFile(result, file)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "lint/style/noRestrictedImports",
          }),
        ]),
      );
    }
  });

  it("accepts other next/navigation hooks", () => {
    const output = lintSingle(
      join(directories[0], "pathname.ts"),
      'import { usePathname, useSearchParams } from "next/navigation"; export { usePathname, useSearchParams };',
    );
    expect(output).not.toContain("lint/style/noRestrictedImports");
  });

  it("lets only useNavigation call useRouter", () => {
    const file = join(root, "src/hooks/use-navigation.ts");
    expect(lintText(file, restrictedRuleFlag)).not.toContain(
      "lint/style/noRestrictedImports",
    );
  });

  it("rejects re-exports of the legacy router", () => {
    expect(
      lintSingle(
        join(directories[0], "re-export.ts"),
        'export { useRouter } from "next/router";',
      ),
    ).toContain("lint/style/noRestrictedImports");
  });

  it("also enforces the import policy on copied components", () => {
    expect(
      lintSingle(
        vendorFile,
        'import Router from "next/router"; export { Router };',
      ),
    ).toContain("lint/style/noRestrictedImports");
  });
});

describe("route-only Firebase import restrictions", () => {
  it.each([
    "firebase",
    "firebase/auth",
    "firebase/firestore",
    "firebase-admin",
    "firebase-admin/auth",
    "@/lib/firebase/client",
  ])("rejects %s in Next.js route entrypoints", (modulePath) => {
    const entries = ["page.tsx", "layout.tsx", "template.tsx"];
    const files = entries.map((entry) => {
      const file = join(directories[0], entry);
      writeFileSync(
        file,
        `import * as SDK from "${modulePath}"; export { SDK };`,
      );
      return file;
    });
    const result = lintJson(files, restrictedRuleFlag);
    for (const file of files) {
      const fileDiagnostics = diagnosticsForFile(result, file);
      expect(fileDiagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "lint/style/noRestrictedImports",
          }),
        ]),
      );
    }
  });

  it("allows Firebase imports in dedicated client components and data modules", () => {
    const output = lintSingle(
      join(directories[0], "_components.tsx"),
      'import { getAuth } from "firebase/auth"; export { getAuth };',
    );
    expect(output).not.toContain("lint/style/noRestrictedImports");
  });

  it("allows route entrypoints to import an application data module", () => {
    const output = lintSingle(
      join(directories[0], "page.tsx"),
      'import { readProfile } from "@/lib/firebase/firestore/user-preferences"; export { readProfile };',
    );
    expect(output).not.toContain("lint/style/noRestrictedImports");
  });

  it("keeps legacy Next.js imports prohibited in route entrypoints", () => {
    const output = lintSingle(
      join(directories[0], "page.tsx"),
      'import { useRouter } from "next/router"; export { useRouter };',
    );
    expect(output).toContain("lint/style/noRestrictedImports");
  });
});

describe("dependency inversion in route hooks and components", () => {
  const routeParent = "src/app";
  const [appDirectory] = createTempDirs([routeParent], "port-");
  const hooks = join(appDirectory, "_hooks");
  const components = join(appDirectory, "_components");
  mkdirSync(hooks);
  mkdirSync(components);
  afterAll(() => removeTempPaths([appDirectory]));

  it.each([
    'import { getAuth } from "firebase/auth"; export { getAuth };',
    'import { app } from "@/lib/firebase/client"; export { app };',
    'import { readProfile } from "../_lib/data"; export { readProfile };',
    'import { firebaseGateway } from "../_lib/gateway"; export { firebaseGateway };',
    'import { updateProfile } from "../_lib/actions"; export { updateProfile };',
    'import { getAuth } from "firebase-admin/auth"; export { getAuth };',
  ])("rejects infrastructure imports in hooks and components: %s", (source) => {
    for (const [directory, name] of [
      [hooks, "use-port.ts"],
      [components, "port-form.tsx"],
    ] as const) {
      expect(lintSingle(join(directory, name), source)).toContain(
        "lint/style/noRestrictedImports",
      );
    }
  });

  it("lets a provider composition root import the adapter", () => {
    const output = lintSingle(
      join(components, "port-provider-client.tsx"),
      'import { firebaseGateway } from "../_lib/gateway"; export { firebaseGateway };',
    );
    expect(output).not.toContain("lint/style/noRestrictedImports");
  });
});
