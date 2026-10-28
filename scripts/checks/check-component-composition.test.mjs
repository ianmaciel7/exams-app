import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import {
  checkComponents,
  inspectComponent,
} from "./check-component-conventions.mjs";

const filename = "src/components/account-card.tsx";
const primitiveImport =
  'import { Card as Surface } from "@/components/ui/card";';
const contract = "type AccountCardProps = ComponentProps<typeof Surface>;";

function inspect(content, file = filename) {
  return inspectComponent(content, file).map((issue) => issue.message);
}

function adapter(body, parameter = "props: AccountCardProps") {
  return `${primitiveImport} ${contract} function AccountCard(${parameter}) { ${body} } export { AccountCard };`;
}

function valid(content, file) {
  assert.deepEqual(inspect(content, file), []);
}

function invalid(content, message, file) {
  assert.match(inspect(content, file).join("\n"), message);
}

describe("component composition across server and client graphs", () => {
  it("scans both shared and client files through the repository guard", () => {
    const root = mkdtempSync(join(tmpdir(), "component-composition-"));
    const files = {
      "src/app/account/_components/account-card.tsx": adapter(
        "return <Surface />;",
      ),
      "src/components/ui/extensions/client/account-card.tsx": `"use client";${adapter("return <Surface />;")}`,
      "src/components/ui/extensions/account-card.tsx": adapter(
        "return <Surface />;",
      ),
      "src/components/ui/card.tsx": "invalid registry fixture",
      "src/app/page.tsx": "invalid route fixture",
    };
    try {
      for (const [file, content] of Object.entries(files)) {
        const target = join(root, file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, content);
      }
      const findings = checkComponents(root);
      assert.equal(findings.length, 3);
      assert.deepEqual(
        new Set(findings.map((finding) => finding.file)),
        new Set(Object.keys(files).slice(0, 3)),
      );
      assert.ok(
        findings.every((finding) => /remaining props/.test(finding.message)),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  for (const directive of ["", '"use client";']) {
    const runtime = directive ? "client boundary" : "shared/server module";
    it(`permits a named compound family in a ${runtime}`, () => {
      valid(`${directive}
        function AccountCard(props) { return <Card {...props} />; }
        function AccountCardHeader(props) { return <CardHeader {...props} />; }
        function AccountCardContent(props) { return <CardContent {...props} />; }
        type AccountCardHeaderProps = ComponentProps<typeof CardHeader>;
        export type { AccountCardHeaderProps };
        export { AccountCard, AccountCardHeader, AccountCardContent };
      `);
    });

    it(`checks adapter forwarding in a ${runtime}`, () => {
      valid(`${directive}${adapter("return <Surface {...props} />;")}`);
      invalid(
        `${directive}${adapter("return <Surface />;")}`,
        /remaining props/,
      );
      invalid(
        `${directive}${adapter('return <Surface {...rest} className="fixed" />;', "{ className, children, ...rest }: AccountCardProps")}`,
        /extracted className/,
      );
      invalid(
        `${directive}${adapter("return <Surface {...rest} className={className} />;", "{ className, children, ...rest }: AccountCardProps")}`,
        /extracted children/,
      );
      valid(
        `${directive}${adapter('return <Surface {...rest} className={cn("layout", styles)}>{content}</Surface>;', "{ className: styles, children: content, ...rest }: AccountCardProps")}`,
      );
    });

    it(`rejects static compound construction in a ${runtime}`, () => {
      for (const statement of [
        "AccountCard.Header = Header;",
        'AccountCard["Header"] = Header;',
        "Object.assign(AccountCard, { Header });",
        'Object.defineProperty(AccountCard, "Header", { value: Header });',
        "Object.defineProperties(AccountCard, { Header: { value: Header } });",
      ]) {
        invalid(
          `${directive} function AccountCard() { return <div />; } ${statement} export { AccountCard };`,
          /separate named exports/,
        );
      }
    });
  }

  it("allows simple components without invented compound parts or children", () => {
    valid(
      "function AccountCard() { return <Card />; } export { AccountCard };",
    );
    valid(
      '"use client"; function SaveButton() { return <Button onClick={save} />; } export { SaveButton };',
      "src/app/settings/_components/save-button.tsx",
    );
  });

  it("requires the root, local functions, and related exported part names", () => {
    invalid(
      "function AccountCardHeader() { return <header />; } export { AccountCardHeader };",
      /Declare AccountCard/,
    );
    invalid(
      "function AccountCard() { return <div />; } function OtherPanel() { return <div />; } export { AccountCard, OtherPanel };",
      /Export exactly/,
    );
    invalid(
      "function AccountCard() { return <div />; } const AccountCardHeader = () => <header />; export { AccountCard, AccountCardHeader };",
      /local named function/,
    );
    invalid(
      'function AccountCard() { return <div />; } export { AccountCard }; export { AccountCardHeader } from "./parts";',
      /local named function/,
    );
    invalid(
      "function AccountCard() { return <div />; } function AccountCardinal() { return <div />; } export { AccountCard, AccountCardinal };",
      /Export exactly/,
    );
  });

  it("supports inline, intersected, and Omit adapter contracts", () => {
    valid(
      adapter(
        "return <Surface {...props} />;",
        "props: React.ComponentProps<typeof Surface>",
      ),
    );
    valid(`${primitiveImport}
      type AccountCardProps = Omit<ComponentProps<typeof Surface>, "onClick"> & { active?: boolean };
      function AccountCard(props: AccountCardProps) { return <Surface {...props} />; }
      export { AccountCard };
    `);
    invalid(
      adapter(
        "return <Surface className={className}>{children}</Surface>;",
        "{ className, children }: AccountCardProps",
      ),
      /remaining props/,
    );
  });

  it("rejects direct roots that replace the inherited primitive", () => {
    for (const root of ["div", "OtherPrimitive"]) {
      for (const directive of ["", '"use client";']) {
        invalid(
          `${directive}${adapter(`return <${root} {...props} />;`)}`,
          /must return their inherited primitive Surface/,
        );
      }
    }
  });

  it("preserves React Hook Form Controller render-prop composition", () => {
    for (const name of ["Controller", "FieldController"]) {
      valid(`${primitiveImport}
        import { Controller as ${name} } from "react-hook-form";
        ${contract}
        function AccountCard(props: AccountCardProps) {
          return <${name} render={() => <Surface {...props} />} />;
        }
        export { AccountCard };
      `);
    }
    invalid(
      `${primitiveImport}
      import { Controller } from "another-library";
      ${contract}
      function AccountCard(props: AccountCardProps) {
        return <Controller {...props} />;
      }
      export { AccountCard };
    `,
      /must return their inherited primitive Surface/,
    );
  });

  it("accepts explicit children props and preserves direct function return scope", () => {
    valid(
      adapter(
        "return <Surface {...rest} children={content} />;",
        "{ children: content, ...rest }: AccountCardProps",
      ),
    );
    valid(`${primitiveImport} ${contract}
      function AccountCard(props: AccountCardProps) {
        return <Surface {...props}><Controller render={() => <Surface />} /></Surface>;
      }
      export { AccountCard };
    `);
    valid(
      "function AccountCard() { const state = {}; state.Header = true; return <div />; } export { AccountCard };",
    );
  });

  it("does not infer mandatory adapters from a component name or unrelated import", () => {
    valid(
      'import { Card as Surface } from "another-library"; function AccountCard(props: ComponentProps<typeof Surface>) { return <Surface />; } export { AccountCard };',
    );
    valid(
      'import type { Card as Surface } from "@/components/ui/card"; function AccountCard() { return <div />; } export { AccountCard };',
    );
    valid(
      adapter(
        "return <Surface />;",
        "props: { label: ComponentProps<typeof Surface> }",
      ),
    );
    valid(
      adapter(
        "return <Surface />;",
        "props: ComponentProps<typeof Surface> | { empty: true }",
      ),
    );
  });

  it("respects the existing vendor, test, and framework exclusions", () => {
    const broken = `${primitiveImport} ${contract} export default function AccountCard(props: AccountCardProps) { return <Surface />; }`;
    for (const file of [
      "src/components/ui/card.tsx",
      "src/components/firebase/account-card.tsx",
      "src/components/ai-elements/account-card.tsx",
      "src/app/settings/page.tsx",
      "src/components/account-card.test.tsx",
    ])
      valid(broken, file);
    invalid(
      adapter("return <Surface />;"),
      /remaining props/,
      "src/components/ui/extensions/account-card.tsx",
    );
  });

  it("recognizes directive prologues and leaves async diagnostics to native tools", () => {
    invalid(
      '"use strict"; "use client"; import { cookies } from "next/headers"; function AccountCard() { return <div />; } export { AccountCard };',
      /server-only/,
    );
    // Biome's noNextAsyncClientComponent owns this diagnostic, including named exports.
    valid(
      '"use client"; async function AccountCard() { return <div />; } export { AccountCard };',
    );
    valid(
      "async function AccountCard() { return <div />; } export { AccountCard };",
    );
    // The repository hook guard separately owns async workflow handlers.
    invalid(
      '"use client"; function AccountCard() { const save = async () => {}; return <Button onClick={save} />; } export { AccountCard };',
      /asynchronous workflow handlers/,
    );
  });

  it("distinguishes erased types from runtime server-only imports", () => {
    valid(
      'type AccountCardProps = ComponentProps<"div">; function AccountCard(props: AccountCardProps) { return <div {...props} />; } export { type AccountCardProps, AccountCard };',
    );
    for (const statement of [
      'import type { RequestCookies } from "next/headers";',
      'import { type RequestCookies } from "next/headers";',
    ])
      valid(
        `"use client"; ${statement} function AccountCard() { return <div />; } export { AccountCard };`,
      );
    invalid(
      '"use client"; import { type RequestCookies, cookies } from "next/headers"; function AccountCard() { return <div />; } export { AccountCard };',
      /server-only/,
    );
    invalid(
      '"use client"; import "server-only"; function AccountCard() { return <div />; } export { AccountCard };',
      /server-only/,
    );
    invalid(
      '"use client"; import {} from "server-only"; function AccountCard() { return <div />; } export { AccountCard };',
      /server-only/,
    );
  });
});

describe("repository runtime naming enforcement", () => {
  it("reports an unsuffixed browser integration during a full source scan", () => {
    const root = mkdtempSync(join(tmpdir(), "component-runtime-"));
    const file = "src/components/ui/extensions/account-card.tsx";
    try {
      const target = join(root, file);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(
        target,
        `"use client"; import { ThemeProvider } from "next-themes";${adapter("return <Surface {...props} />;")}`,
      );
      const findings = checkComponents(root);
      assert.equal(findings.length, 1);
      assert.equal(findings[0].file, file);
      assert.match(findings[0].message, /-client.tsx/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
