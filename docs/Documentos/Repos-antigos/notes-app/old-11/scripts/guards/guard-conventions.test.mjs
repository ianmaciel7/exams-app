import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import {
  CONVENTION_RULES,
  checkFile,
  stripComments,
} from "./guard-conventions-lib.mjs";

const ruleIds = (relPath, content) =>
  checkFile(relPath, content).map((v) => v.rule);

test("rule ids are unique", () => {
  const ids = CONVENTION_RULES.map((rule) => rule.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("flags forwardRef, useContext and preemptive memoization", () => {
  const content = `
import { forwardRef, useCallback, useContext, useMemo } from "react";
const a = forwardRef(() => null);
const b = useContext(Ctx);
const c = useMemo(() => 1, []);
const d = useCallback(() => 1, []);
`;
  assert.deepEqual(ruleIds("src/hooks/use-x.ts", content).sort(), [
    "no-forward-ref",
    "no-forward-ref",
    "no-preemptive-memo",
    "no-preemptive-memo",
    "no-use-context",
  ]);
});

test("ignores matches inside comments", () => {
  const content = `// do not use forwardRef(\n/* useMemo( */\nexport const x = 1;\n`;
  assert.deepEqual(ruleIds("src/lib/x.ts", content), []);
});

test("stripComments keeps line numbers stable", () => {
  const stripped = stripComments("a\n/* b\nc */\nd // e\n");
  assert.equal(stripped.split("\n").length, 5);
  assert.ok(!stripped.includes("e"));
});

test("flags window.location mutation but not reads", () => {
  assert.deepEqual(ruleIds("src/lib/x.ts", `window.location.href = "/x";`), [
    "no-window-location",
  ]);
  assert.deepEqual(ruleIds("src/lib/x.ts", `window.location.assign("/x");`), [
    "no-window-location",
  ]);
  assert.deepEqual(
    ruleIds("src/lib/x.ts", `const o = window.location.origin;`),
    []
  );
});

test("flags palette and hex colors, allows semantic tokens", () => {
  assert.deepEqual(
    ruleIds("src/app/x.tsx", `<div className="bg-zinc-50 dark:bg-black" />`),
    ["no-hardcoded-color"]
  );
  assert.deepEqual(
    ruleIds("src/app/x.tsx", `<div className="text-[#fff]" />`),
    ["no-hardcoded-color"]
  );
  assert.deepEqual(
    ruleIds(
      "src/app/x.tsx",
      `<div className="bg-background text-foreground border-destructive/20" />`
    ),
    []
  );
});

test("flags !important in css", () => {
  assert.deepEqual(
    ruleIds("src/app/globals.css", `a { color: red !important; }`),
    ["no-important"]
  );
});

test("default exports are allowed only for Next.js entrypoints", () => {
  const content = `export default function Thing() { return null; }`;
  assert.deepEqual(
    ruleIds("src/components/notes-app/thing-card.tsx", content),
    ["no-default-export"]
  );
  assert.deepEqual(ruleIds("src/app/(auth)/login/page.tsx", content), []);
  assert.deepEqual(
    ruleIds("src/app/error.tsx", `"use client";\n${content}`),
    []
  );
  assert.deepEqual(
    ruleIds("src/lib/x.ts", `const x = 1;\nexport { x as default };`),
    ["no-default-export"]
  );
});

test("error boundaries must declare use client", () => {
  assert.deepEqual(
    ruleIds("src/app/error.tsx", `export default function E() {}`),
    ["error-boundary-use-client"]
  );
  assert.deepEqual(
    ruleIds(
      "src/app/global-error.tsx",
      `// c\n"use client";\nexport default function E() {}`
    ),
    []
  );
});

test("file and folder names must be kebab-case", () => {
  assert.deepEqual(ruleIds("src/lib/MyHelper.ts", `export const x = 1;`), [
    "kebab-case-filename",
  ]);
  assert.deepEqual(ruleIds("src/lib/my_helper.ts", `export const x = 1;`), [
    "kebab-case-filename",
  ]);
  assert.deepEqual(ruleIds("src/MyDir/helper.ts", `export const x = 1;`), [
    "kebab-case-filename",
  ]);
  assert.deepEqual(
    ruleIds("src/app/[spaceId]/(auth)/my-page.test.tsx", `export const x = 1;`),
    []
  );
});

test("file names must not exceed MAX_FILENAME_LENGTH", () => {
  const longName =
    "this-is-an-extremely-long-file-name-that-definitely-exceeds-the-maximum-limit.ts";
  assert.deepEqual(ruleIds(`src/lib/${longName}`, `export const x = 1;`), [
    "max-filename-length",
  ]);
  assert.deepEqual(
    ruleIds("src/lib/concise-file-name.ts", `export const x = 1;`),
    []
  );
});

test("test files, vendor trees and non-src paths are exempt", () => {
  const bad = `import { forwardRef } from "react";\nexport default forwardRef;`;
  assert.deepEqual(ruleIds("src/hooks/use-x.test.ts", bad), []);
  assert.deepEqual(
    ruleIds(
      "src/components/ui/button.tsx",
      bad.replace("export default", "export")
    ),
    []
  );
  assert.deepEqual(ruleIds("src/components/firebase/Foo.tsx", bad), []);
  assert.deepEqual(ruleIds("scripts/Foo.mjs", bad), []);
});

test("flags template-literal and concatenated classNames", () => {
  assert.deepEqual(
    ruleIds(
      "src/components/notes-app/x-card.tsx",
      ["<div className={`", "$", "{A} p-2`} />"].join("")
    ),
    ["use-cn-for-class-merge"]
  );
  assert.deepEqual(
    ruleIds(
      "src/components/notes-app/x-card.tsx",
      `<div className={"a " + b} />`
    ),
    ["use-cn-for-class-merge"]
  );
  assert.deepEqual(
    ruleIds(
      "src/components/notes-app/x-card.tsx",
      `<div className={cn(A, "p-2")} />`
    ),
    []
  );
});

test("flags renderX props in tsx but not in ts", () => {
  assert.deepEqual(
    ruleIds(
      "src/components/notes-app/x-card.tsx",
      "type P = { renderRow?: () => null };"
    ),
    ["no-render-props-api"]
  );
  assert.deepEqual(
    ruleIds("src/instrumentation.ts", "const a = { renderSource: 1 };"),
    []
  );
});

test("flags the classic shadcn Form import", () => {
  assert.deepEqual(
    ruleIds(
      "src/components/notes-app/x-form.tsx",
      `import { Form } from "@/components/ui/form";`
    ),
    ["no-classic-form-api"]
  );
});

test("anonymous default exports are flagged even on Next.js entrypoints", () => {
  assert.deepEqual(ruleIds("src/app/page.tsx", "export default () => null;"), [
    "named-default-export",
  ]);
  assert.deepEqual(
    ruleIds("src/app/page.tsx", "export default async function () {}"),
    ["named-default-export"]
  );
});

test("server action modules need use server and a zod import", () => {
  assert.deepEqual(
    ruleIds(
      "src/app/actions.ts",
      `import { z } from "zod";
export async function a() {}`
    ),
    ["server-action-use-server"]
  );
  assert.deepEqual(
    ruleIds(
      "src/lib/save.ts",
      `"use server";
export async function a() {}`
    ),
    ["server-action-validates-input"]
  );
  assert.deepEqual(
    ruleIds(
      "src/lib/save.ts",
      `"use server";
import { z } from "zod";
export async function a() {}`
    ),
    []
  );
});

test("registry primitives are exempt from the project guard", () => {
  // Their file shape is review-only (CONVENTIONS.md Enforcement Index), so no
  // mechanical rule may fire on them.
  const ui = (content) => ruleIds("src/components/ui/thing.tsx", content);
  assert.deepEqual(ui("export function Thing() {}\nexport { Thing };"), []);
  assert.deepEqual(
    ui("interface P {}\nfunction Thing() {}\nexport { Thing };"),
    []
  );
  assert.deepEqual(ui("export default function Thing() {}"), []);
});

test("flags arbitrary px/rem values that the Tailwind scale covers", () => {
  const card = (className) =>
    ruleIds(
      "src/components/notes-app/x-card.tsx",
      `<span className="${className}" />`
    );
  assert.deepEqual(card("text-[13px] truncate"), ["prefer-standard-scale"]);
  assert.deepEqual(card("w-[500px]"), ["prefer-standard-scale"]);
  assert.deepEqual(card("text-sm w-125 min-h-[50vh]"), []);
});

test("Button must use a size variant instead of a size-*/h-* override", () => {
  const card = (jsx) => ruleIds("src/components/notes-app/x-card.tsx", jsx);
  assert.deepEqual(
    card(
      `<Button\n  size="icon"\n  onClick={() => run()}\n  className="size-6 shrink-0"\n/>`
    ),
    ["button-size-variant"]
  );
  assert.deepEqual(
    card(`<Button size="sm" className={cn("h-9", className)} />`),
    ["button-size-variant"]
  );
  assert.deepEqual(
    card(`<Button size="icon-xs" className="shrink-0 w-full" />`),
    []
  );
  assert.deepEqual(
    card(`<Spinner className="size-8" /><Button>Go</Button>`),
    []
  );
});

test("overlay content is not restricted to a dedicated file", () => {
  const content = `<Dialog><DialogContent /></Dialog>`;
  assert.deepEqual(ruleIds("src/components/notes-app/x-card.tsx", content), []);
  assert.deepEqual(
    ruleIds("src/components/notes-app/settings-dialog.tsx", content),
    []
  );
});

test("a surface name in the file name needs the matching primitive", () => {
  const app = (name, content) =>
    ruleIds(`src/components/notes-app/${name}.tsx`, content);
  const sidebar = `import { SidebarMenu } from "@/components/ui/sidebar";`;
  assert.deepEqual(app("space-sidebar-empty", "const a = 1;"), [
    "name-matches-surface",
  ]);
  assert.deepEqual(app("spaces-empty", "const a = 1;"), []);
  assert.deepEqual(app("sidebar-user-menu", sidebar), []);
  assert.deepEqual(app("space-sidebar", "const a = 1;"), []);
  assert.deepEqual(app("settings-dialog", "const a = 1;"), []);
});

test("data-testid must start with the component file name", () => {
  const app = (name, jsx) =>
    ruleIds(`src/components/notes-app/${name}.tsx`, jsx);
  assert.deepEqual(
    app("spaces-empty", `<div data-testid="space-switcher-empty" />`),
    ["testid-starts-with-component"]
  );
  assert.deepEqual(
    app(
      "space-sidebar",
      ["<li data-testid={`space-item-", "$", "{id}`} />"].join("")
    ),
    ["testid-starts-with-component"]
  );
  assert.deepEqual(
    app("spaces-empty", `<div data-testid="spaces-empty" />`),
    []
  );
  assert.deepEqual(
    app("spaces-empty", `<b data-testid="spaces-empty-create-btn" />`),
    []
  );
  assert.deepEqual(
    app(
      "space-sidebar",
      ["<li data-testid={`space-sidebar-item-", "$", "{id}`} />"].join("")
    ),
    []
  );
  assert.deepEqual(app("spaces-empty", `<b data-testid="spaces-emptyish" />`), [
    "testid-starts-with-component",
  ]);
});

test("application components stay under the line limit", () => {
  const big = `${"const a = 1;\n".repeat(400)}`;
  assert.deepEqual(ruleIds("src/components/notes-app/x-card.tsx", big), [
    "max-component-lines",
  ]);
  assert.deepEqual(
    ruleIds("src/components/notes-app/x-card.tsx", "const a = 1;\n"),
    []
  );
  assert.deepEqual(ruleIds("src/app/page.tsx", big), []);
});

test("guard-conventions passes on the current src/ directory", () => {
  const output = execFileSync(
    "node",
    ["scripts/guards/guard-conventions.mjs"],
    {
      encoding: "utf8",
    }
  );
  assert.match(output, /comply with the mechanical CONVENTIONS\.md rules/);
});
